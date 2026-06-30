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
| `avatarCell` | **In-cell image** for the avatar (Insert → Image → Image in cell). If empty, the website shows a default **princess** avatar. | _(image in cell)_ |
| `youtubeUrl` | Full YouTube link (watch, youtu.be, embed, or shorts) | `https://www.youtube.com/watch?v=y_92xI5zY8g` |
| `themeColor` | Hex accent color | `#ffd84d` |
| `collectibleCell` | **In-cell image** for the collectible icon. If empty, the website shows a default **shining coin**. | _(image in cell)_ |
| `collectibleName` | Plural label in score UI | `lanterns` |
| `avatarUrl` | **Auto-filled URL** mirroring `avatarCell`. The script writes the in-cell image's temporary URL here (on edit, and on first read if empty). Usually leave blank. | _(auto)_ |
| `collectibleUrl` | **Auto-filled URL** mirroring `collectibleCell`. Same behavior as `avatarUrl`. Usually leave blank. | _(auto)_ |

> Put the two URL columns (`avatarUrl`, `collectibleUrl`) **at the end** of the table. If a
> URL column already holds a value, it is used as-is; otherwise the script reads the matching
> in-cell image, caches its temporary URL into the column, and uses that.

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
| `imageCell` | **In-cell image** (Insert → Image → Image in cell). When added/changed, the script writes its temporary URL into `imageUrl`. | _(image in cell)_ |
| `imageUrl` | **URL column** mirroring `imageCell` (lives at the end of the table). If it already has a value (a reference URL, `assets/...` path, or a cached in-cell URL) it is used as-is; otherwise the script fills it from `imageCell`. | `https://example.com/a.jpg` |

The manager picks a `Location` from the dropdown. The script attaches the image to the
location whose `name` matches that dropdown value — no id/formula column is needed.

### Setting up the `Location` dropdown

1. Select the `Location` column (below the header).
2. **Data → Data validation → Add rule**.
3. Criteria: **Dropdown (from a range)** → `Locations!B2:B` (the `name` column).

## In-cell images

You can add pictures directly in the sheet instead of pasting URLs:

1. Click the target cell in an image column (`avatarCell`, `collectibleCell`, or `imageCell`).
2. **Insert → Image → Image in cell** (or the 📷 *Insert image* menu → *Insert image in cell*).
3. Upload a file or pick from Drive/by URL.

How it is used:

- The Apps Script reads the in-cell image and returns a **temporary Google-hosted URL**
  (`CellImage.getContentUrl()`) that the website loads as the photo.
- Every image column has a matching **URL column at the end of its table**
  (`avatarCell`→`avatarUrl`, `collectibleCell`→`collectibleUrl`, `imageCell`→`imageUrl`):
  - On **edit**, when you add/change an in-cell image, the on-edit trigger writes its
    temporary URL into the matching URL column. Removing the image clears it.
  - On **read** (Web App fetch), if the URL column already has a value it is used as-is;
    otherwise the script reads the in-cell image, caches its URL into the column, and uses it.
- For `Characters`, if both the image cell and URL column are empty, the website shows a
  built-in default (princess avatar / shining coin).
- Temporary in-cell URLs can expire; re-adding the image (or clearing the URL column so it is
  re-resolved) refreshes them.
- The Sheet must remain accessible to the Web App owner (it runs as **Me**), since the
  content URL is tied to that account.

> **Setup:** the on-edit behavior (image-URL caching and location geocoding) runs from an
> **installable trigger**. In the Apps Script editor, run **`setupTriggers`** once and approve
> the permissions. A plain `onEdit` simple trigger cannot use Maps geocoding or write cells.

## Delimiter rule

No column needs a pipe character `|`. Each image is its own row on the `Images` tab, and
collectible toast messages live in code, not on the sheet.

## Manager tips

- Just type the place into the Locations `name` column — `latitude`/`longitude` fill in automatically (override them manually if the geocoded spot is slightly off).
- Give each location a unique `name` on the `Locations` tab; the `Images` tab matches on it.
- Add a photo: go to the `Images` tab, pick the `Location` from the dropdown, then add an in-cell image (or paste a URL in `imageUrl`).
- Reorder photos by moving rows up/down within the `Images` tab.
- Changes appear on the live site after visitors **refresh** the page (no redeploy).
- Share the sheet with **Editor** access only for people who should change content.
