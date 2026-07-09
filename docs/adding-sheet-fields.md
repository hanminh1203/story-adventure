# Adding fields in Google Sheets and adapting the implementation

This guide explains how to add a new content column to the Story Adventures Google Sheet and wire it through to the live game. For the current column layout, see [apps-script/SHEET-SCHEMA.md](../apps-script/SHEET-SCHEMA.md).

## How data flows

```
Google Sheet (3 tabs)
    ↓  read on each Web App request
Apps Script (Code.gs)  →  JSON payload
    ↓  fetch at runtime
Frontend (characterData.js)  →  React UI
```

1. **Sheet** — managers edit rows on `Characters`, `Locations`, or `Images`.
2. **Apps Script** — `doGet()` reads the sheets, maps column headers to JSON properties, and returns `{ characters: [...] }`.
3. **Frontend** — `loadCharacters()` fetches the Web App URL, `normalizeCharacters()` cleans URLs and numbers, and components read properties from each character/location object.

Extra columns on the sheet are **ignored** until you update Apps Script to read them. The validator will flag them as warnings.

## Current field mapping

### Characters tab → JSON character object

| Sheet column     | JSON property       | Used in UI |
|------------------|---------------------|------------|
| `name`           | `name`              | Character card, linking locations |
| `title`          | `title`             | Character card subtitle |
| `avatarCell`     | `avatarUrl`         | Gameplay avatar, tutorial |
| `youtubeUrl`     | `youtubeUrl`        | Character card iframe |
| `themeColor`     | `themeColor`        | Accent colour (CSS `--guide-accent`) |
| `collectibleCell`| `collectibleImage`  | Score icon, collectibles in slideshow |
| `collectibleName`| `collectibleName`   | Score label, final screen |

`id` is **not** stored on the sheet; Apps Script generates it per request from row order.

### Locations tab → JSON location object (nested under each character)

| Sheet column  | JSON property | Used in UI |
|---------------|---------------|------------|
| `Character`   | _(grouping key only)_ | Links row to `Characters.name` |
| `name`        | `name`        | Map pin, panel title, details modal |
| `description` | `description` | Map panel, details modal |
| `latitude`    | `lat`         | Cesium camera target |
| `longitude`   | `lon`         | Cesium camera target |
| `height`      | `height`      | Camera altitude |
| _(Images tab)_| `images[]`    | Slideshow in details modal |

### Images tab → `location.images[]`

| Sheet column | JSON | Used in UI |
|--------------|------|------------|
| `Location`   | _(grouping key)_ | Must match `Locations.name` |
| `image`      | URL string in array | Slideshow photos |

## Checklist: add a new field end to end

Work through these steps in order. Skip steps that do not apply to your field type.

### 1. Add the column in Google Sheets

1. Open the correct tab (`Characters`, `Locations`, or `Images`).
2. Insert a new column and add the **exact** header text in **row 1** (case-sensitive).
3. Fill in values from row 2 downward.
4. If the field links to another tab, set up a **dropdown** (Data → Data validation → Dropdown from a range), same as `Character` and `Location` today.

**Naming tips**

- Use camelCase for new headers (e.g. `shortBio`) to match existing columns.
- Foreign-key columns that link to another tab use the linked entity name (`Character`, `Location`) or a clear name documented in the schema.
- Image columns should end in `Cell` when they hold in-cell images or URLs (e.g. `avatarCell`); the script maps them to `…Url` / `…Image` in JSON.

### 2. Document the column

Update [apps-script/SHEET-SCHEMA.md](../apps-script/SHEET-SCHEMA.md):

- Add a row to the relevant tab table (description, example, any dropdown/geocoding notes).
- Note whether the column is required, unique, or auto-filled.

### 3. Add validation rules

Update `getValidationSchema()` in [apps-script/validation.gs](../apps-script/validation.gs):

```javascript
{ name: 'yourColumn', required: false, unique: false }
```

Optional rule properties:

| Property     | When to use |
|--------------|-------------|
| `required: true` | Every data row must have a value |
| `unique: true`   | No duplicate values in the column (e.g. `name`) |
| `foreignKey: { sheet: 'Characters', column: 'name' }` | Value must exist on another tab |
| `check: checkHexColor` (or a custom function) | Type/format validation |

Reuse existing check functions where possible: `checkImageOrUrl`, `checkYouTubeUrl`, `checkHexColor`, `checkLatitude`, `checkLongitude`, `checkNonNegativeNumber`.

Run **Story Adventures → Validate sheet data** in the Sheet (or `validateSheets` in the Apps Script editor) to confirm the new column passes.

### 4. Map the column in Apps Script

Update the relevant reader in [apps-script/Code.gs](../apps-script/Code.gs):

- **Character fields** → `readCharacters()`
- **Location fields** → `readLocationsByCharacter()`
- **Image fields** → `readImages()`

**Plain text or number**

```javascript
// In readCharacters(), inside the return { ... } object:
shortBio: String(row.shortBio || '').trim(),
```

**Image cell (in-cell image or URL)**

```javascript
bannerUrl: cellToImageUrl(row.bannerCell),
```

**Number with fallback**

```javascript
zoomLevel: toNumber(row.zoomLevel),
```

Choose a clear **JSON property name** for the website. It does not have to match the sheet header (e.g. `avatarCell` → `avatarUrl`, `latitude` → `lat`).

#### Special case: geocoded or auto-filled columns

If the new Locations column should be filled when `name` is edited (like `latitude` / `longitude` / `height`):

1. Add the header to the sheet.
2. Extend `syncLocationCoordsOnEdit()` and `refreshLocationCoords()` to read/write the column via `table.headerMap.yourColumn`.
3. Optionally extend `geocodeLocation()` if the value is derived from the Maps API.

If the column is filled by a **separate** trigger or formula, only map it in `readLocationsByCharacter()`; no geocode changes needed.

### 5. Redeploy the Web App (Apps Script changes only)

After editing `Code.gs` or `validation.gs`:

1. **Deploy → Manage deployments → Edit → New version → Deploy**
2. The `/exec` URL stays the same; no GitHub redeploy is required for sheet-only content changes, but **code** changes need a new Apps Script deployment.

Sheet edits alone only require visitors to **refresh** the game page.

### 6. Adapt the frontend (when the UI should show the field)

Files to touch depend on what you are exposing.

| Layer | File | Purpose |
|-------|------|---------|
| Normalization | `src/lib/characterData.js` | Sanitize URLs, coerce numbers, defaults |
| Display | Relevant `.jsx` under `src/components/` | Render the new property |
| Labels / copy | `src/uiText.js` | Fixed UI strings (not sheet-driven) |
| Styling | `src/style.css` | New layout or visual treatment |

**Pass-through text** — if you only add a string field and render it in one component, mapping in `Code.gs` plus `{location.newField}` in JSX may be enough. `normalizeCharacters()` already spreads `...character` and `...location`.

**URLs** — run through `sanitizeMediaUrl()` in `characterData.js` (same as `avatarUrl` and `images`).

**Numbers** — coerce with `Number(...)` in `normalizeCharacters()` if the UI depends on numeric comparison.

**Defaults** — add fallbacks in a small helper (see `src/lib/collectibles.js` for `getCharacterAvatarImage`) or in `constants.js` for shared assets.

### 7. Verify

1. **Sheet:** Story Adventures → Validate sheet data — fix all errors.
2. **API:** Open the Web App `/exec` URL in a browser; confirm the new property appears in JSON.
3. **App:** `npm run dev`, hard-refresh, walk through character select → gameplay → details modal.
4. **Production:** After frontend changes, run `npm run build` and push; after Apps Script changes, redeploy the Web App.

## Worked examples

### Example A: Optional character tagline (`Characters` tab)

**Goal:** Show a one-line tagline under the character title.

1. Sheet: add column `tagline` on `Characters`.
2. `SHEET-SCHEMA.md`: document optional text column.
3. `validation.gs`: `{ name: 'tagline', required: false }`.
4. `Code.gs` in `readCharacters()`:
   ```javascript
   tagline: String(row.tagline || '').trim(),
   ```
5. `CharacterCard.jsx`: render `{character.tagline}` below the title.
6. Redeploy Web App; refresh the game.

No change to `characterData.js` unless you need sanitization.

### Example B: Location visit order label (`Locations` tab)

**Goal:** Show a custom label on the map panel (e.g. "Stop 3").

1. Sheet: add `stopLabel` on `Locations`.
2. Schema + validation entries.
3. `Code.gs` in `readLocationsByCharacter()`:
   ```javascript
   stopLabel: String(row.stopLabel || '').trim(),
   ```
4. `GameplayScreen.jsx`: display `currentLoc.stopLabel` in the location panel.
5. Redeploy Web App.

### Example C: New image metadata (`Images` tab)

**Goal:** Store a caption per slideshow image.

This requires a **shape change**: today each location has `images: string[]` (URLs only). Captions need objects, e.g. `images: [{ url, caption }]`.

1. Sheet: add `caption` on `Images`.
2. Update `readImages()` to build objects instead of plain strings (or a parallel `captionsByLocation` map merged in `readLocationsByCharacter()`).
3. Update `normalizeCharacters()` to handle the new shape.
4. Update `DetailsModal.jsx` to show `image.caption`.
5. Redeploy Web App **and** ship a frontend build.

Plan JSON shape before editing the sheet so you do not break existing deployments.

## What you usually do **not** need to change

- **`.env` / `VITE_CHARACTERS_DATA_URL`** — unchanged unless you create a new Sheet deployment.
- **`setupTriggers`** — only if you add new on-edit automation (not for passive columns).
- **GitHub Actions** — only for frontend code changes, not sheet content.
- **Tab names** — must stay `Characters`, `Locations`, `Images` unless you update `CHARACTERS_SHEET`, `LOCATIONS_SHEET`, `IMAGES_SHEET` in `Code.gs`.

## UI copy vs sheet content

Some strings are **not** driven by the sheet:

- Button labels such as "LET'S GO!" and character select text → `src/uiText.js`
- Collectible toast messages → `src/lib/collectibles.js` / `uiText.js`
- How-to-play steps → `uiText.js`

To make those manager-editable, add new sheet columns **and** replace the hard-coded constants with values from the JSON payload using the same checklist above.

## Quick reference: files to edit

| Change type | Files |
|-------------|--------|
| New sheet column (documented) | Google Sheet, `SHEET-SCHEMA.md` |
| Validation | `apps-script/validation.gs` |
| JSON output | `apps-script/Code.gs` |
| Geocoding / on-edit | `Code.gs` (`handleEdit`, `syncLocationCoordsOnEdit`, `refreshLocationCoords`) |
| Frontend display | `src/lib/characterData.js`, relevant `src/components/**/*.jsx`, optionally `src/style.css` |
| Deploy | Apps Script redeploy; `npm run build` + git push if frontend changed |

## Related docs

- [apps-script/SHEET-SCHEMA.md](../apps-script/SHEET-SCHEMA.md) — full column reference for content editors
- [apps-script/README.md](../apps-script/README.md) — initial Apps Script setup and troubleshooting
- [README.md](../README.md) — project architecture and local development
