# Google Sheet layout

The manager edits a Google Sheet with **three tabs**: `Characters`, `Locations`, and `Images`. Header names must match exactly (row 1).

## Tab: `Characters`

One row per character guide.

> No `id` column is needed. The Apps Script generates a per-request `id` (by row order)
> that the website uses to track the selected character.

| Column | Description | Example |
|--------|-------------|---------|
| `name` | Display name. **Locations link to a character by this name.** | `Tjingeling` |
| `title` | Subtitle on character card | `The Latern Traveller` |
| `avatarCell` | Avatar image, read **straight from the cell**: either an **in-cell image** (Insert → Image → Image in cell) or a pasted URL / `assets/...` path. If empty, the website shows a default **princess** avatar. | _(image in cell)_ or `https://example.com/a.jpg` |
| `youtubeUrl` | Full YouTube link (watch, youtu.be, embed, or shorts) | `https://www.youtube.com/watch?v=y_92xI5zY8g` |
| `themeColor` | Hex accent color | `#ffd84d` |
| `collectibleCell` | Collectible icon, read **straight from the cell**: either an **in-cell image** or a pasted URL / `assets/...` path. If empty, the website shows a default **shining coin**. | _(image in cell)_ or `https://example.com/c.png` |
| `collectibleName` | Plural label in score UI | `lanterns` |

> `avatarCell` and `collectibleCell` are read directly on each request — no
> separate URL columns are needed, and nothing is written back to the sheet.

> Note: collectible toast messages and the character-card button label are defined in
> code (`COLLECT_MESSAGES` and `SELECT_BUTTON_LABEL` in `script.js`), not on this sheet.

## Tab: `Locations`

One row per tour stop. Row order within the same character is the **Next / Previous** order in the game.

| Column | Description | Example |
|--------|-------------|---------|
| `Character` | **Dropdown** of character names (data validation from `Characters!name`). This is the foreign key that links the location to a character. | `Tjingeling` |
| `name` | **Location chip / place name.** Type a place here; the script geocodes it and auto-fills `latitude`/`longitude`. **Images link to a location by this name** (give each location a unique name). | `Eiffel Tower` |
| `description` | Shown in pin panel and details | Short paragraph |
| `latitude` | **Auto-filled** from `name` on edit. Geocoded latitude. | `48.8584` |
| `longitude` | **Auto-filled** from `name` on edit. Geocoded longitude. | `2.2945` |
| `height` | Camera distance in meters (lower = closer) | `1500` |
| `heading` | Optional compass degrees | leave blank or `0` |

The manager picks a `Character` from the dropdown. The script groups locations under the
character whose `name` matches that dropdown value — no id/formula column is needed.

Give every location a **unique** `name` — this is what the `Images` tab matches on.

> When you enter (or change) a value in `name`, the on-edit trigger geocodes it and writes the
> result into `latitude` and `longitude`. If the place can't be found or the cell is cleared,
> both columns are emptied. You can still override the coordinates manually afterwards.

### Setting up the `Character` dropdown

1. Select the `Character` column (below the header).
2. **Data → Data validation → Add rule**.
3. Criteria: **Dropdown (from a range)** → `Characters!A2:A` (the `name` column).

## Tab: `Images`

One row per slideshow image. Images are matched to a location by the **`Location` name**, and
appear in the slideshow in **row order**.

| Column | Description | Example |
|--------|-------------|---------|
| `Location` | **Dropdown** of location names (data validation from `Locations!name`). This is the foreign key that links the image to a location. | `Eiffel Tower` |
| `image` | One column for the photo, read **straight from the cell**: either an **in-cell image** (Insert → Image → Image in cell) or a plain URL / `assets/...` path. The script resolves whichever the cell holds. | _(image in cell)_ or `https://example.com/a.jpg` |

The manager picks a `Location` from the dropdown. The script attaches the image to the
location whose `name` matches that dropdown value — no id/formula column is needed.

### Setting up the `Location` dropdown

1. Select the `Location` column (below the header).
2. **Data → Data validation → Add rule**.
3. Criteria: **Dropdown (from a range)** → `Locations!B2:B` (the `name` column).

## Images: in-cell image or URL

Each image column (`avatarCell`, `collectibleCell`, `image`) accepts **either** an in-cell
image **or** a plain URL — the script reads whichever the cell holds, on each request.

To add a picture directly in the sheet:

1. Click the target image cell.
2. **Insert → Image → Image in cell** (or the 📷 *Insert image* menu → *Insert image in cell*).
3. Upload a file or pick from Drive/by URL.

Or just paste a full URL / `assets/...` path into the same cell instead.

How it is used:

- For an **in-cell image**, the Apps Script returns a **temporary Google-hosted URL**
  (`CellImage.getContentUrl()`) that the website loads as the photo. For a **text value**, the
  cell's URL / path is used as-is.
- Images are resolved **straight from the cell on every Web App fetch** — there are no separate
  URL columns and the script never writes image URLs back to the sheet.
- For `Characters`, if the image cell is empty, the website shows a built-in default
  (princess avatar / shining coin).
- The Sheet must remain accessible to the Web App owner (it runs as **Me**), since an in-cell
  image's content URL is tied to that account.

> **Setup:** the location geocoding runs from an **installable trigger**. In the Apps Script
> editor, run **`setupTriggers`** once and approve the permissions. A plain `onEdit` simple
> trigger cannot use Maps geocoding or write cells. Running `setupTriggers` also installs a
> **nightly** trigger (`runFullSync`, ~midnight in the script's timezone) that re-geocodes every
> location.

### Running the automation nightly and on demand

The location geocoding runs in three ways:

- **On edit** — when you change a Locations `name` cell (handled by `handleEdit`).
- **Nightly** — `runFullSync` runs automatically around midnight and re-geocodes every location.
  It is installed automatically when you run **`setupTriggers`** (no extra setup needed).
- **Manually from the Sheet** — open the Sheet and use the menu
  **Story Adventures → Refresh all data now** (added by `onOpen`). The first time you click it
  Google asks you to authorize the script.

> The full sync **re-geocodes every location and overwrites** its `latitude`/`longitude`/`height`
> (so any manual coordinate tweaks are replaced by the fresh geocoded values — locations whose
> name can't be geocoded are left untouched). Image cells are never modified.

> If the **Story Adventures** menu does not appear, reload the Sheet (the `onOpen` trigger runs on
> open). If the nightly run isn't firing, re-run **`setupTriggers`** in the Apps Script editor.

## Delimiter rule

No column needs a pipe character `|`. Each image is its own row on the `Images` tab, and
collectible toast messages live in code, not on the sheet.

## Manager tips

- Just type the place into the Locations `name` column — `latitude`/`longitude` fill in automatically (override them manually if the geocoded spot is slightly off).
- Give each location a unique `name` on the `Locations` tab; the `Images` tab matches on it.
- Add a photo: go to the `Images` tab, pick the `Location` from the dropdown, then add an in-cell image (or paste a URL) in the `image` column.
- Reorder photos by moving rows up/down within the `Images` tab.
- Changes appear on the live site after visitors **refresh** the page (no redeploy).
- Share the sheet with **Editor** access only for people who should change content.
