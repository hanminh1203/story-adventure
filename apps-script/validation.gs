/**
 * validation.gs — schema validation for the Story Adventures sheets.
 *
 * Checks that the Characters / Locations / Images tabs match the layout in
 * SHEET-SCHEMA.md: every required tab and column header exists, each cell holds
 * the right kind of value, unique columns have no duplicates, and the
 * foreign-key links (Locations."Character" → Characters."name",
 * Images."Location" → Locations."name") all resolve.
 *
 * Run validateSheets() from the Apps Script editor, or from the Sheet via
 * "Story Adventures → Validate sheet data". The report is shown in a dialog
 * (when a UI is available) and always written to the execution log.
 *
 * Reuses helpers from Code.gs (readSheet, getCellImageUrl) — both files share
 * one Apps Script project namespace.
 */

/**
 * Column rules per sheet, mirroring SHEET-SCHEMA.md. Each column entry:
 *   - name       : exact header text expected in row 1
 *   - required   : true if the cell must be non-empty on every data row
 *   - unique     : true if values must be unique within the column
 *   - foreignKey : { sheet, column } the value must exist in
 *   - check      : function(value) -> null | message | { level, message }
 */
function getValidationSchema() {
  return {
    Characters: [
      { name: 'name', required: true, unique: true },
      { name: 'title', required: false },
      { name: 'avatarCell', required: false, check: checkImageOrUrl },
      { name: 'youtubeUrl', required: false, check: checkYouTubeUrl },
      { name: 'themeColor', required: false, check: checkHexColor },
      { name: 'collectibleCell', required: false, check: checkImageOrUrl },
      { name: 'collectibleName', required: false }
    ],
    Locations: [
      { name: 'Character', required: true, foreignKey: { sheet: 'Characters', column: 'name' } },
      { name: 'name', required: true, unique: true },
      { name: 'description', required: false },
      { name: 'latitude', required: false, check: checkLatitude },
      { name: 'longitude', required: false, check: checkLongitude },
      { name: 'height', required: false, check: checkNonNegativeNumber },
      { name: 'heading', required: false, check: checkHeading }
    ],
    Images: [
      { name: 'Location', required: true, foreignKey: { sheet: 'Locations', column: 'name' } },
      { name: 'image', required: true, check: checkImageOrUrl }
    ]
  };
}

/**
 * Validates every sheet against the schema and reports the result. Returns
 * { errors, warnings, issues, text } so it can also be called from other code.
 */
function validateSheets() {
  var schema = getValidationSchema();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var issues = [];

  // Read each schema sheet once (when present); record missing tabs as errors.
  var tables = {};
  Object.keys(schema).forEach(function (sheetName) {
    if (!ss.getSheetByName(sheetName)) {
      issues.push(makeIssue('error', sheetName, null, null, 'Missing required tab "' + sheetName + '".'));
      return;
    }
    tables[sheetName] = readSheet(sheetName);
  });

  Object.keys(schema).forEach(function (sheetName) {
    var table = tables[sheetName];
    if (table) validateOneSheet(sheetName, schema[sheetName], table, tables, issues);
  });

  return reportValidationIssues(issues);
}

/**
 * Validates one sheet: header presence, unexpected extra columns, and every
 * data cell (required / unique / foreign key / type).
 */
function validateOneSheet(sheetName, columns, table, tables, issues) {
  // Required headers.
  columns.forEach(function (col) {
    if (!table.headerMap[col.name]) {
      issues.push(makeIssue('error', sheetName, 1, col.name, 'Missing required column header "' + col.name + '".'));
    }
  });

  // Unexpected headers (warning only — extra columns are ignored by the reader).
  var expected = {};
  columns.forEach(function (col) { expected[col.name] = true; });
  Object.keys(table.headerMap).forEach(function (header) {
    if (!expected[header]) {
      issues.push(makeIssue('warning', sheetName, 1, header, 'Unexpected column "' + header + '" (not in schema; it will be ignored).'));
    }
  });

  // Precompute foreign-key reference sets and per-column "seen" trackers.
  var fkSets = {};
  columns.forEach(function (col) {
    if (col.foreignKey) {
      fkSets[col.name] = buildValueSet(tables[col.foreignKey.sheet], col.foreignKey.column);
    }
  });
  var seen = {};

  table.rows.forEach(function (record) {
    columns.forEach(function (col) {
      if (!table.headerMap[col.name]) return; // header missing already reported
      var value = record.data[col.name];
      var present = isCellPresent(value);

      if (!present) {
        if (col.required) {
          issues.push(makeIssue('error', sheetName, record.rowIndex, col.name, 'Required value is empty.'));
        }
        return; // nothing else to check on an empty optional cell
      }

      if (col.unique) {
        if (!seen[col.name]) seen[col.name] = {};
        var key = String(value).trim();
        if (seen[col.name][key] != null) {
          issues.push(makeIssue('error', sheetName, record.rowIndex, col.name,
            'Duplicate value "' + truncateValue(key) + '" (also on row ' + seen[col.name][key] + '). Values must be unique.'));
        } else {
          seen[col.name][key] = record.rowIndex;
        }
      }

      if (col.foreignKey) {
        var fkKey = String(value).trim();
        if (!fkSets[col.name][fkKey]) {
          issues.push(makeIssue('error', sheetName, record.rowIndex, col.name,
            'Value "' + truncateValue(fkKey) + '" does not match any ' + col.foreignKey.sheet + '."' + col.foreignKey.column + '".'));
        }
      }

      if (col.check) {
        var res = col.check(value);
        if (res) {
          var level = (res && typeof res === 'object') ? (res.level || 'error') : 'error';
          var message = (res && typeof res === 'object') ? res.message : res;
          issues.push(makeIssue(level, sheetName, record.rowIndex, col.name, message));
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
 * Per-column value checks. Return null when OK, a string for an error, or
 * { level: 'warning'|'error', message } for finer control.
 * ------------------------------------------------------------------------ */

// In-cell image, or a plain text URL / assets path.
function checkImageOrUrl(value) {
  if (value && typeof value === 'object') {
    return getCellImageUrl(value) ? null
      : 'Cell holds an object that is not a readable in-cell image.';
  }
  var s = String(value).trim();
  if (looksLikeUrlOrPath(s)) return null;
  return { level: 'warning', message: 'Value "' + truncateValue(s) + '" is not an in-cell image and does not look like a URL or assets/ path.' };
}

function checkYouTubeUrl(value) {
  var s = String(value).trim();
  if (isYouTubeUrl(s)) return null;
  return 'Value "' + truncateValue(s) + '" is not a recognizable YouTube link.';
}

function checkHexColor(value) {
  var s = String(value).trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)) return null;
  return 'Value "' + truncateValue(s) + '" is not a hex color like #ffd84d.';
}

function checkLatitude(value) {
  var n = Number(value);
  if (isNaN(n)) return 'Latitude "' + truncateValue(String(value)) + '" is not a number.';
  if (n < -90 || n > 90) return 'Latitude ' + n + ' is out of range (-90 to 90).';
  return null;
}

function checkLongitude(value) {
  var n = Number(value);
  if (isNaN(n)) return 'Longitude "' + truncateValue(String(value)) + '" is not a number.';
  if (n < -180 || n > 180) return 'Longitude ' + n + ' is out of range (-180 to 180).';
  return null;
}

function checkNonNegativeNumber(value) {
  var n = Number(value);
  if (isNaN(n)) return '"' + truncateValue(String(value)) + '" is not a number.';
  if (n < 0) return 'Value ' + n + ' must be zero or positive.';
  return null;
}

function checkHeading(value) {
  var n = Number(value);
  if (isNaN(n)) return 'Heading "' + truncateValue(String(value)) + '" is not a number.';
  if (n < 0 || n > 360) return 'Heading ' + n + ' is out of range (0 to 360).';
  return null;
}

/* --------------------------------------------------------------------------
 * Helpers.
 * ------------------------------------------------------------------------ */

// A cell counts as present if it holds an object (e.g. in-cell image) or any
// non-whitespace text.
function isCellPresent(value) {
  if (value == null) return false;
  if (typeof value === 'object') return true;
  return String(value).trim() !== '';
}

// Set of trimmed text values found in a column of a table (skips in-cell images
// and blanks). Used for foreign-key membership tests.
function buildValueSet(table, column) {
  var set = {};
  if (!table) return set;
  table.rows.forEach(function (record) {
    var v = record.data[column];
    if (v != null && typeof v !== 'object') {
      var s = String(v).trim();
      if (s) set[s] = true;
    }
  });
  return set;
}

function isYouTubeUrl(s) {
  return /(?:youtube\.com\/(?:watch\?|embed\/|shorts\/)|youtu\.be\/)/i.test(s);
}

function looksLikeUrlOrPath(s) {
  return /^https?:\/\//i.test(s) ||
         /^(?:\.\.?\/)?assets\//i.test(s) ||
         /\.(png|jpe?g|gif|webp|svg|bmp)(\?|#|$)/i.test(s);
}

function truncateValue(s) {
  s = String(s);
  return s.length > 60 ? s.slice(0, 57) + '...' : s;
}

function makeIssue(level, sheet, row, column, message) {
  return { level: level, sheet: sheet, row: row, column: column, message: message };
}

/**
 * Builds a human-readable report, logs it, and shows it in a dialog when a UI
 * is available (it isn't when run from a time-based trigger).
 */
function reportValidationIssues(issues) {
  var errors = issues.filter(function (i) { return i.level === 'error'; });
  var warnings = issues.filter(function (i) { return i.level === 'warning'; });

  var lines = [];
  if (!issues.length) {
    lines.push('All sheets match the schema. No problems found.');
  } else {
    lines.push(errors.length + ' error(s), ' + warnings.length + ' warning(s):');
    lines.push('');
    issues.forEach(function (i) {
      var loc = i.sheet +
        (i.row ? ' row ' + i.row : '') +
        (i.column ? ' [' + i.column + ']' : '');
      lines.push((i.level === 'error' ? 'ERROR  ' : 'WARN   ') + loc + ' — ' + i.message);
    });
  }
  var text = lines.join('\n');
  Logger.log(text);
  try {
    var ui = SpreadsheetApp.getUi();
    ui.alert('Schema validation', text, ui.ButtonSet.OK);
  } catch (e) {
    // No UI (e.g. run from a trigger) — the execution log holds the report.
  }
  return { errors: errors.length, warnings: warnings.length, issues: issues, text: text };
}
