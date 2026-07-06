# Apps Script setup

1. Create a Google Sheet with three tabs named **`Characters`**, **`Locations`**, and **`Images`**.
2. Add the header rows described in [SHEET-SCHEMA.md](SHEET-SCHEMA.md), including the `Character`/`Location` dropdowns.
3. In the Sheet: **Extensions → Apps Script**.
4. Replace the default `Code.gs` with the contents of [Code.gs](Code.gs) in this folder.
5. In the Apps Script editor, select the **`setupTriggers`** function and **Run** it once, then
   approve the permissions. This installs the on-edit trigger that geocodes the Locations `name`
   column into `latitude`/`longitude`. You can also re-geocode every location on demand from the
   Sheet via **Story Adventures → Refresh all data now**. (Image columns need no trigger — they are
   read straight from the cell on each request.)
6. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the Web App URL (ends in `/exec`).
8. Set `VITE_CHARACTERS_DATA_URL` in `.env` (or the `CHARACTERS_DATA_URL` GitHub Actions secret) to that URL.
9. Push to GitHub — no redeploy is needed for future sheet edits; only refresh the game page.

## Verify

Open the Web App URL in a browser. You should see JSON like:

```json
{"characters":[{"id":"1","name":"Tjingeling",...,"locations":[...]}]}
```

## Validate the sheet

To check that all tabs/columns follow [SHEET-SCHEMA.md](SHEET-SCHEMA.md), run the
**`validateSheets`** function (in `validation.gs`) from the Apps Script editor, or use the Sheet
menu **Story Adventures → Validate sheet data**. It reports, per row/column, any missing tabs or
headers, empty required cells, bad values (colors, coordinates, YouTube links, images), duplicate
`name`s, and broken `Character` / `Location` links. Errors must be fixed; warnings are advisory.

## Troubleshooting

- **Missing sheet tab** — tab names must be exactly `Characters`, `Locations`, and `Images`.
- **Empty characters** — check that row 1 has exact header names and data starts on row 2.
- **A location has no photos** — confirm the `Images` tab `Location` value exactly matches a `name` on the `Locations` tab (use the dropdown), and that each location has a unique `name`.
- **A location/photo is missing** — the `Character` / `Location` dropdown value must exactly match a `name` in the source tab (`Characters!name` / `Locations!name`); rows that don't match are skipped.
- **In-cell image not showing** — make sure it was added with **Insert → Image → Image in cell** (not a floating image over the grid), and that the Web App owner can access the Sheet. Alternatively paste a plain URL / `assets/...` path into the same cell — the script reads whichever the cell holds.
- **Coordinates not auto-filling / on-edit not working** — run **`setupTriggers`** once in the Apps Script editor and approve permissions. The simple `onEdit` trigger can't geocode or write cells; the installable trigger (`handleEdit`) can.
- **CORS / fetch errors** — redeploy the Web App after code changes; use the `/exec` URL, not `/dev`.
