/**
 * Google Apps Script Web App for Magical Story Adventures.
 *
 * Paste this into Extensions → Apps Script on your Google Sheet, then deploy as
 * a Web App (Execute as: Me, Who has access: Anyone).
 *
 * IMPORTANT — one-time setup for the edit automation:
 *   Run setupTriggers() once from the Apps Script editor and grant the
 *   permissions it asks for. This installs:
 *     - an on-edit trigger (handleEdit) that reacts to individual cell edits, and
 *     - a nightly time-based trigger (runFullSync) that re-runs the same
 *       automation across every row (handy for refreshing expiring in-cell
 *       image URLs and filling in any missing coordinates).
 *   Both run with full authorization, which the geocoding (Maps) and in-cell
 *   image reading require — a plain simple onEdit trigger is not allowed to use
 *   them. The same full sync can also be triggered manually from the Sheet via
 *   the "Story Adventures → Refresh all data now" menu (added by onOpen).
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

/**
 * Maps each in-cell image column to the plain-text URL column that mirrors it.
 * The URL column lives at the end of the same table and caches the temporary
 * Google-hosted URL of the in-cell image.
 */
var IMAGE_URL_COLUMNS = {
  avatarCell: 'avatarUrl',
  collectibleCell: 'collectibleUrl',
  imageCell: 'imageUrl'
};

// Hour of day (0–23, script timezone) for the nightly runFullSync trigger.
// The trigger fires within the hour starting here, i.e. between 00:00–01:00.
var NIGHTLY_TRIGGER_HOUR = 0;

// Custom Sheet menu (added by onOpen) for running the full sync on demand.
var MENU_TITLE = 'Story Adventures';
var MENU_REFRESH_ITEM = 'Refresh all data now';

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
      // Use the cached URL column if present; otherwise resolve the in-cell
      // image, write the temporary URL back into the URL column, and use it.
      avatarUrl: resolveImageUrl(table, record, 'avatarCell'),
      youtubeUrl: String(row.youtubeUrl || '').trim(),
      themeColor: String(row.themeColor || '').trim(),
      collectibleImage: resolveImageUrl(table, record, 'collectibleCell'),
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
    var heading = row.heading;
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
    if (heading !== '' && heading != null) {
      location.heading = toNumber(heading);
    }
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
    // Use the cached imageUrl column if present; otherwise resolve the in-cell
    // image, write the temporary URL back into imageUrl, and use it.
    var url = resolveImageUrl(table, record, 'imageCell');
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
 * Installs the automation triggers. Run this once from the Apps Script editor.
 * Safe to re-run: it removes any existing handleEdit / runFullSync triggers
 * first. Installs:
 *   - handleEdit  : on-edit trigger (reacts to individual cell edits)
 *   - runFullSync : nightly time-based trigger (~midnight, script timezone)
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
  // Nightly full refresh in the script's timezone (see NIGHTLY_TRIGGER_HOUR).
  ScriptApp.newTrigger('runFullSync')
    .timeBased()
    .atHour(NIGHTLY_TRIGGER_HOUR)
    .everyDays(1)
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
    .addToUi();
}

/**
 * Runs the on-edit automation across every row of every sheet. Used by the
 * nightly trigger and the "Refresh all data now" menu item.
 *
 * Mirrors handleEdit, but applied to the whole table instead of a single cell:
 *   - Refreshes the cached image URL for every in-cell image (avatarCell /
 *     collectibleCell / imageCell) so expiring temporary URLs are renewed.
 *     Manually entered URLs (reference links, assets/ paths) are preserved:
 *     a URL column is only overwritten when its cell actually holds an in-cell
 *     image.
 *   - Re-geocodes every Locations row and overwrites its latitude/longitude
 *     (and height), even when those cells were already filled. Rows whose name
 *     can't be geocoded are left as-is.
 */
function runFullSync() {
  refreshImageUrls(CHARACTERS_SHEET, ['avatarCell', 'collectibleCell']);
  refreshImageUrls(IMAGES_SHEET, ['imageCell']);
  refreshLocationCoords();
}

/**
 * Re-reads every in-cell image in the given columns and writes its current
 * temporary URL into the matching URL column. Skips rows where the image cell
 * has no in-cell image, so any manually entered URL is left as-is.
 */
function refreshImageUrls(sheetName, cellHeaders) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(sheetName)) return;
  var table = readSheet(sheetName);
  table.rows.forEach(function (record) {
    cellHeaders.forEach(function (cellHeader) {
      var cellCol = table.headerMap[cellHeader];
      var urlCol = table.headerMap[IMAGE_URL_COLUMNS[cellHeader]];
      if (!cellCol || !urlCol) return;
      var url = getCellImageUrl(record.data[cellHeader]);
      if (url) {
        table.sheet.getRange(record.rowIndex, urlCol).setValue(url);
      }
    });
  });
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
  var nameCol = table.headerMap.name;
  var latCol = table.headerMap.latitude;
  var lonCol = table.headerMap.longitude;
  var heightCol = table.headerMap.height;
  if (!nameCol || (!latCol && !lonCol && !heightCol)) return;

  table.rows.forEach(function (record) {
    var query = String(record.data.name || '').trim();
    if (!query) return;

    var coords = geocodeLocation(query);
    if (!coords) return;
    if (latCol) table.sheet.getRange(record.rowIndex, latCol).setValue(coords.lat);
    if (lonCol) table.sheet.getRange(record.rowIndex, lonCol).setValue(coords.lng);
    if (heightCol && coords.height != null) {
      table.sheet.getRange(record.rowIndex, heightCol).setValue(coords.height);
    }
  });
}

/**
 * On-edit handler (installable trigger). Reacts to two kinds of edits:
 *   1. An in-cell image added/changed in avatarCell / collectibleCell / imageCell
 *      → writes the temporary URL into the matching URL column.
 *   2. A location entered in Locations."name" → geocodes it and fills
 *      latitude/longitude (clearing them when empty or not found).
 */
function handleEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  var sheetName = sheet.getName();
  var row = e.range.getRow();
  var col = e.range.getColumn();
  if (row < 2) return; // header row

  var headerMap = getHeaderMap(sheet);

  if (sheetName === CHARACTERS_SHEET) {
    syncImageUrlOnEdit(sheet, headerMap, row, col, ['avatarCell', 'collectibleCell']);
  } else if (sheetName === IMAGES_SHEET) {
    syncImageUrlOnEdit(sheet, headerMap, row, col, ['imageCell']);
  } else if (sheetName === LOCATIONS_SHEET) {
    syncLocationCoordsOnEdit(sheet, headerMap, row, col);
  }
}

/**
 * When an in-cell image column is edited, cache its temporary URL in the
 * matching URL column. Clears the URL column when the image is removed.
 */
function syncImageUrlOnEdit(sheet, headerMap, row, editedCol, cellHeaders) {
  for (var i = 0; i < cellHeaders.length; i++) {
    var cellHeader = cellHeaders[i];
    var cellCol = headerMap[cellHeader];
    if (!cellCol || cellCol !== editedCol) continue;
    var urlCol = headerMap[IMAGE_URL_COLUMNS[cellHeader]];
    if (!urlCol) continue;
    var cellValue = sheet.getRange(row, cellCol).getValue();
    var url = getCellImageUrl(cellValue);
    sheet.getRange(row, urlCol).setValue(url || '');
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
 * Resolves the usable URL for an in-cell image column:
 *   - If the matching URL column already holds a value, use it.
 *   - Otherwise read the in-cell image, write its temporary URL back into the
 *     URL column (so it is cached for next time), and use it.
 */
function resolveImageUrl(table, record, cellHeader) {
  var urlHeader = IMAGE_URL_COLUMNS[cellHeader];
  var existing = String((record.data[urlHeader] != null ? record.data[urlHeader] : '')).trim();
  if (existing) return existing;

  var url = getCellImageUrl(record.data[cellHeader]);
  if (url) {
    var urlCol = table.headerMap[urlHeader];
    if (urlCol) {
      try {
        table.sheet.getRange(record.rowIndex, urlCol).setValue(url);
      } catch (err) {
        // Read-only contexts (rare) just skip the cache write.
      }
    }
  }
  return url;
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
