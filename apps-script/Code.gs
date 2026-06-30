/**
 * Google Apps Script Web App for Magical Story Adventures.
 *
 * Paste this into Extensions → Apps Script on your Google Sheet, then deploy as
 * a Web App (Execute as: Me, Who has access: Anyone).
 *
 * IMPORTANT — one-time setup for the edit automation:
 *   Run setupTriggers() once from the Apps Script editor and grant the
 *   permissions it asks for. This installs an on-edit trigger (handleEdit) that
 *   geocodes the Locations "name" column into latitude/longitude. It runs with
 *   full authorization, which the geocoding (Maps) requires — a plain simple
 *   onEdit trigger is not allowed to use it. A full re-geocode of every row can
 *   also be triggered manually from the Sheet via the
 *   "Story Adventures → Refresh all data now" menu (added by onOpen).
 *
 *   Image columns are read straight from the cell on each Web App request
 *   (doGet): a cell may hold an in-cell image (Insert → Image → Image in cell)
 *   or a plain URL / assets path, and the script resolves whichever is present.
 *   No URL caching columns or image triggers are needed.
 *
 * Sheet tabs required:
 *   - Characters
 *   - Locations
 *   - Images
 *
 * See apps-script/SHEET-SCHEMA.md for column definitions.
 */

/* --------------------------------------------------------------------------
 * Configuration constants.
 * ------------------------------------------------------------------------ */

// Names of the three required sheet tabs (must match the tab names exactly).
var CHARACTERS_SHEET = 'Characters';
var LOCATIONS_SHEET = 'Locations';
var IMAGES_SHEET = 'Images';

// Custom Sheet menu (added by onOpen) for running the full sync on demand.
var MENU_TITLE = 'Story Adventures';
var MENU_REFRESH_ITEM = 'Refresh all data now';
var MENU_VALIDATE_ITEM = 'Validate sheet data';

// Multiplier applied to a geocoding result's viewport diagonal to derive the
// camera height, so the whole place comfortably fits in frame (>1 adds margin).
var VIEWPORT_PADDING_FACTOR = 2;

// Earth's mean radius in meters, used by the Haversine distance calculation.
var EARTH_RADIUS_METERS = 6371000;

function doGet() {
  try {
    var characters = readCharacters();
    var imagesByLocation = readImages();
    var locationsByCharacter = readLocationsByCharacter(imagesByLocation);
    var payload = characters.map(function (character) {
      // Locations link back to a character via the Locations."Character" name.
      var key = String(character.name || '').trim();
      return Object.assign({}, character, {
        locations: locationsByCharacter[key] || []
      });
    });
    return ContentService
      .createTextOutput(JSON.stringify({ characters: payload }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: String(err), characters: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function readCharacters() {
  var table = readSheet(CHARACTERS_SHEET);
  return table.rows.map(function (record) {
    var row = record.data;
    return {
      name: String(row.name || '').trim(),
      title: String(row.title || '').trim(),
      // Read straight from the cell: an in-cell image or a pasted URL.
      avatarUrl: cellToImageUrl(row.avatarCell),
      youtubeUrl: String(row.youtubeUrl || '').trim(),
      themeColor: String(row.themeColor || '').trim(),
      collectibleImage: cellToImageUrl(row.collectibleCell),
      collectibleName: String(row.collectibleName || '').trim()
    };
  }).filter(function (c) { return c.name; }).map(function (character, index) {
    // id is not stored on the sheet; generate a stable per-payload id so the
    // website (script.js) can track the selected character.
    character.id = String(index + 1);
    return character;
  });
}

function readLocationsByCharacter(imagesByLocation) {
  imagesByLocation = imagesByLocation || {};
  var table = readSheet(LOCATIONS_SHEET);
  var grouped = {};
  table.rows.forEach(function (record) {
    var row = record.data;
    // Foreign key: Locations."Character" matches Characters."name".
    var characterName = String(row.Character || row.character || '').trim();
    if (!characterName) return;
    if (!grouped[characterName]) grouped[characterName] = [];
    var name = String(row.name || '').trim();
    // Images live in the Images sheet, matched by Location name.
    var locationImages = imagesByLocation[name] || [];
    var location = {
      name: name,
      description: String(row.description || '').trim(),
      // Columns are "latitude"/"longitude" (older sheets used lat/lon).
      lat: toNumber(pickFirst(row.latitude, row.lat)),
      lon: toNumber(pickFirst(row.longitude, row.lon)),
      height: toNumber(row.height),
      images: locationImages
    };
    grouped[characterName].push(location);
  });
  return grouped;
}

function readImages() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // Images tab is optional; skip gracefully if missing.
  if (!spreadsheet.getSheetByName(IMAGES_SHEET)) return {};
  var table = readSheet(IMAGES_SHEET);
  var byName = {};
  table.rows.forEach(function (record) {
    var row = record.data;
    // Single "image" column holds either an in-cell image or a plain URL.
    var url = cellToImageUrl(row.image);
    if (!url) return;
    // Foreign key: Images."Location" matches Locations."name".
    var locationName = String(row.Location || row.location || '').trim();
    if (!locationName) return;
    if (!byName[locationName]) byName[locationName] = [];
    byName[locationName].push(url);
  });
  return byName;
}

/* --------------------------------------------------------------------------
 * Edit automation (installable trigger — run setupTriggers() once).
 * ------------------------------------------------------------------------ */

/**
 * Installs the automation trigger. Run this once from the Apps Script editor.
 * Safe to re-run: it removes any existing handleEdit trigger (and any leftover
 * runFullSync time-based trigger from older versions) first. Installs:
 *   - handleEdit  : on-edit trigger (reacts to individual cell edits)
 */
function setupTriggers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    var handler = trigger.getHandlerFunction();
    if (handler === 'handleEdit' || handler === 'runFullSync') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  ScriptApp.newTrigger('handleEdit')
    .forSpreadsheet(ss)
    .onEdit()
    .create();
}

/**
 * Simple trigger that adds a custom menu so the manager can run the full sync
 * on demand straight from the Sheet (Story Adventures → Refresh all data now).
 * Runs automatically whenever the spreadsheet is opened.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(MENU_TITLE)
    .addItem(MENU_REFRESH_ITEM, 'runFullSync')
    .addItem(MENU_VALIDATE_ITEM, 'validateSheets')
    .addToUi();
}

/**
 * Runs the location automation across every row. Used by the
 * "Refresh all data now" menu item.
 *
 * Re-geocodes every Locations row and overwrites its latitude/longitude (and
 * height), even when those cells were already filled. Rows whose name can't be
 * geocoded are left as-is. Image columns need no sync — they are read straight
 * from the cell on each request.
 */
function runFullSync() {
  refreshLocationCoords();
}

/**
 * Re-geocodes every Locations row that has a name and overwrites its
 * latitude/longitude (and height when available) with the fresh result, even
 * if those cells were already filled. Rows whose name can't be geocoded (or is
 * empty) are left as-is, so a transient Maps failure won't wipe existing data.
 */
function refreshLocationCoords() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(LOCATIONS_SHEET)) return;
  var table = readSheet(LOCATIONS_SHEET);
  if (!table.rows.length) return;
  var nameCol = table.headerMap.name;
  var latCol = table.headerMap.latitude;
  var lonCol = table.headerMap.longitude;
  var heightCol = table.headerMap.height;
  if (!nameCol || (!latCol && !lonCol && !heightCol)) return;

  // Read each target column once, update in memory, write each back once.
  var span = getDataRowSpan(table);
  var latValues = latCol ? table.sheet.getRange(span.firstRow, latCol, span.numRows, 1).getValues() : null;
  var lonValues = lonCol ? table.sheet.getRange(span.firstRow, lonCol, span.numRows, 1).getValues() : null;
  var heightValues = heightCol ? table.sheet.getRange(span.firstRow, heightCol, span.numRows, 1).getValues() : null;
  var changed = false;

  table.rows.forEach(function (record) {
    var query = String(record.data.name || '').trim();
    if (!query) return;

    var coords = geocodeLocation(query);
    if (!coords) return;
    var i = record.rowIndex - span.firstRow;
    if (latValues) latValues[i][0] = coords.lat;
    if (lonValues) lonValues[i][0] = coords.lng;
    if (heightValues && coords.height != null) heightValues[i][0] = coords.height;
    changed = true;
  });

  if (!changed) return;
  if (latValues) table.sheet.getRange(span.firstRow, latCol, span.numRows, 1).setValues(latValues);
  if (lonValues) table.sheet.getRange(span.firstRow, lonCol, span.numRows, 1).setValues(lonValues);
  if (heightValues) table.sheet.getRange(span.firstRow, heightCol, span.numRows, 1).setValues(heightValues);
}

/**
 * On-edit handler (installable trigger). Reacts to a location entered in
 * Locations."name" → geocodes it and fills latitude/longitude (clearing them
 * when empty or not found). Image columns are read straight from the cell on
 * each request, so they need no on-edit handling.
 */
function handleEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  var sheetName = sheet.getName();
  var row = e.range.getRow();
  var col = e.range.getColumn();
  if (row < 2) return; // header row

  if (sheetName === LOCATIONS_SHEET) {
    var headerMap = getHeaderMap(sheet);
    syncLocationCoordsOnEdit(sheet, headerMap, row, col);
  }
}

/**
 * When Locations."name" is edited, geocode the entered place and fill the
 * longitude/latitude/height columns. Clears them when the cell is empty or the
 * place can't be found.
 */
function syncLocationCoordsOnEdit(sheet, headerMap, row, editedCol) {
  var nameCol = headerMap.name;
  if (!nameCol || editedCol !== nameCol) return;
  var latCol = headerMap.latitude;
  var lonCol = headerMap.longitude;
  var heightCol = headerMap.height;
  if (!latCol && !lonCol && !heightCol) return;

  var query = String(sheet.getRange(row, nameCol).getDisplayValue() || '').trim();
  var coords = query ? geocodeLocation(query) : null;

  if (latCol) sheet.getRange(row, latCol).setValue(coords ? coords.lat : '');
  if (lonCol) sheet.getRange(row, lonCol).setValue(coords ? coords.lng : '');
  if (heightCol) {
    sheet.getRange(row, heightCol).setValue(coords && coords.height != null ? coords.height : '');
  }
}

/**
 * Geocodes a place name/address to { lat, lng, height }, or null if not found.
 * Height is a camera-altitude heuristic derived from the result's viewport: the
 * diagonal distance (in meters) across the viewport bounds, so larger places get
 * a higher camera. Requires authorization (installed trigger / Web App), not a
 * simple trigger.
 */
function geocodeLocation(query) {
  try {
    var response = Maps.newGeocoder().geocode(query);
    if (response && response.status === 'OK' && response.results && response.results.length) {
      var geometry = response.results[0].geometry;
      var location = geometry.location;
      var result = { lat: location.lat, lng: location.lng };
      var viewport = geometry.viewport;
      if (viewport && viewport.northeast && viewport.southwest) {
        var ne = viewport.northeast;
        var sw = viewport.southwest;
        result.height = Math.round(haversineDistance(sw.lat, sw.lng, ne.lat, ne.lng) * VIEWPORT_PADDING_FACTOR);
      }
      return result;
    }
  } catch (err) {
    // Maps quota/permission errors fall through to "not found".
  }
  return null;
}

/**
 * Great-circle distance in meters between two lat/lng points (Haversine).
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  var R = EARTH_RADIUS_METERS;
  var toRad = function (deg) { return deg * Math.PI / 180; };

  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);

  var a = Math.pow(Math.sin(dLat / 2), 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.pow(Math.sin(dLon / 2), 2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* --------------------------------------------------------------------------
 * Sheet helpers.
 * ------------------------------------------------------------------------ */

/**
 * Reads a sheet into a table object so callers can both read values and write
 * back to specific cells:
 *   { sheet, headerMap: { header -> 1-based column }, rows: [{ rowIndex, data }] }
 */
function readSheet(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Missing sheet tab: ' + sheetName);
  }
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return { sheet: sheet, headerMap: buildHeaderMap(values[0] || []), rows: [] };
  }
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var headerMap = buildHeaderMap(headers);
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row.every(function (cell) { return cell === '' || cell == null; })) continue;
    var obj = {};
    headers.forEach(function (header, j) {
      if (header) obj[header] = row[j];
    });
    rows.push({ rowIndex: i + 1, data: obj });
  }
  return { sheet: sheet, headerMap: headerMap, rows: rows };
}

function buildHeaderMap(headers) {
  var map = {};
  headers.forEach(function (header, j) {
    var key = String(header).trim();
    if (key) map[key] = j + 1; // 1-based column index
  });
  return map;
}

function getHeaderMap(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return {};
  return buildHeaderMap(sheet.getRange(1, 1, 1, lastCol).getValues()[0]);
}

/**
 * Resolves a cell value to a usable image URL, whatever it holds:
 *   - an in-cell image (Insert → Image → Image in cell) → its temporary URL, or
 *   - a plain text value (full URL or assets/ path) → the trimmed text.
 * Returns '' when the cell is empty or unusable.
 */
function cellToImageUrl(value) {
  var inCellUrl = getCellImageUrl(value);
  if (inCellUrl) return inCellUrl;
  if (value != null && typeof value !== 'object') {
    return String(value).trim();
  }
  return '';
}

/**
 * Returns the contiguous span of populated data rows for a table read by
 * readSheet(): { firstRow, numRows }. Used to read/write whole columns at once.
 * Note: readSheet skips fully-empty rows, so this span can include them; batch
 * callers read existing values first and only overwrite the rows they touch.
 */
function getDataRowSpan(table) {
  var firstRow = table.rows[0].rowIndex;
  var lastRow = table.rows[table.rows.length - 1].rowIndex;
  return { firstRow: firstRow, numRows: lastRow - firstRow + 1 };
}

/**
 * Reads a temporary Google-hosted URL from an in-cell image value
 * (inserted via Insert → Image → Image in cell). Returns '' for anything else.
 */
function getCellImageUrl(value) {
  if (value && typeof value === 'object' && typeof value.getContentUrl === 'function') {
    try {
      var contentUrl = value.getContentUrl();
      if (contentUrl) return String(contentUrl);
    } catch (e) {
      // getContentUrl can fail if the image type is unsupported; fall through.
    }
    if (typeof value.getUrl === 'function') {
      try {
        var sourceUrl = value.getUrl();
        if (sourceUrl) return String(sourceUrl);
      } catch (e2) {
        // ignore
      }
    }
  }
  return '';
}

function pickFirst() {
  for (var i = 0; i < arguments.length; i++) {
    var value = arguments[i];
    if (value !== '' && value != null) return value;
  }
  return '';
}

function toNumber(value) {
  if (value === '' || value == null) return 0;
  var n = Number(value);
  return isNaN(n) ? 0 : n;
}
