# Magical Story Adventures

An interactive educational game built with CesiumJS. Children pick a storybook guide, fly a 3D globe between real-world landmarks, explore photo slideshows, and collect hidden treasures for points — inspired by Google Earth-style exploration.

No API key required for the default setup.

## How it works

1. **Start screen** — intro and **LET'S GO!**
2. **Character select** — choose one of four guides (each has a YouTube intro video)
3. **Gameplay** — the camera flies between that character's locations on a 3D globe
4. **Details & collectibles** — open **Show details** on a location pin to browse images; click hidden collectibles for 1 point each
5. **Final screen** — total score, then **RESTART** to play again

Navigation does not wrap: **Previous** is hidden on the first stop, and **Next** becomes **Finalize** on the last.

## Project structure

| Path | Purpose |
|------|---------|
| `index.html` | Page layout, screen markup, HTML `<template>` elements |
| `script.js` | Game flow, Cesium viewer, camera flights, slideshow, scoring |
| `style.css` | Screens, HUD, pin panel, details modal, collectibles |
| `assets/` | Character avatars, collectible icons, and background images |
| `apps-script/` | Google Apps Script source + sheet column reference |

## Editing content (manager guide)

Character and location data lives in a **Google Sheet**. No code or git is required to update the game.

1. Open the shared Google Sheet (your team lead will send the link).
2. Edit the **Characters** tab for guides (names, colors, YouTube ids, etc.).
3. Edit the **Locations** tab for tour stops — pick the **Character** from the dropdown (this links the stop to that character), give the stop a unique `name`, then set description, coordinates, etc.
4. Edit the **Images** tab to manage slideshow photos — pick the **Location** from the dropdown (this links the photo to that location by name) and add the photo (see below).
5. Save — changes appear when players **refresh** the game page (no redeploy).

**Adding photos** — you can either:

- **Insert image in cell** (recommended): click the `imageCell` (or `avatarCell` / `collectibleCell`) cell, then **Insert → Image → Image in cell** and upload. The app shows the inserted picture automatically.
- **Paste a URL**: put an `https://` link in the reference column (`imageUrl` / `avatarUrl` / `collectibleImage`). Used only when the matching in-cell image is empty.

**Tips**

- On **Locations**, choose the **Character** from the dropdown — its `name` links the stop to a character. Give each stop a unique `name`.
- Location **row order** within the same character is the order **Next** / **Previous** follows.
- On **Images**, choose the **Location** from the dropdown — its `name` links the photo to a location. Each photo is its own row; **row order** sets the slideshow order.
- In-cell images are served via temporary Google URLs refreshed on each load; the reference URL columns are kept as a fallback.
- **Camera height** is in meters — lower values zoom closer.
- For coordinates, right-click a place in Google Maps and copy lat/lon.

Full column reference: [apps-script/SHEET-SCHEMA.md](apps-script/SHEET-SCHEMA.md)

### First-time setup (developers)

1. Create the Sheet with `Characters`, `Locations`, and `Images` tabs per [apps-script/SHEET-SCHEMA.md](apps-script/SHEET-SCHEMA.md) (including the `Character` / `Location` dropdowns).
2. Paste [apps-script/Code.gs](apps-script/Code.gs) into the Sheet's Apps Script editor.
3. Deploy as a Web App (Execute as **Me**, access **Anyone**) — see [apps-script/README.md](apps-script/README.md).
4. Set `CHARACTERS_DATA_URL` in `script.js` to the deployed `/exec` URL.
5. Share the Sheet with **Editor** access for managers who should edit content.

## Data format reference

The Apps Script Web App returns nested JSON consumed by the game:

```json
{
  "characters": [
    {
      "id": "1",
      "name": "Tjingeling",
      "title": "The Latern Traveller",
      "avatarUrl": "assets/avatar-tjingeling.png",
      "youtubeUrl": "https://www.youtube.com/watch?v=y_92xI5zY8g",
      "themeColor": "#ffd84d",
      "collectibleImage": "assets/collectible-lantern.svg",
      "collectibleName": "lanterns",
      "locations": [
        {
          "name": "Eiffel Tower",
          "description": "Short text shown in the pin panel and details modal.",
          "lat": 48.8584,
          "lon": 2.2945,
          "height": 1500,
          "images": ["https://example.com/photo1.jpg"]
        }
      ]
    }
  ]
}
```

## Running locally

No build step. Asset paths are relative (e.g. `assets/avatar-tjingeling.png`), so they resolve whether the page is served over HTTP or opened as a `file://` URL. Serving over HTTP is still recommended:

```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080` (or the port shown).

## Controls

| Input | Action |
|-------|--------|
| **← / →** | Previous / next location (gameplay) |
| **← / →** | Previous / next slideshow image (details open); **→** on the last image closes details and advances |
| **Space** | Open details for the current location |
| **Escape** | Close details modal |
| **Enter** | Activate focused button on start, character select, or final screen |

Buttons disable during camera flights so animations cannot overlap.

## Map and imagery

- **Globe:** CesiumJS 1.142 (Apache 2.0)
- **Imagery:** Esri World Imagery (free public service, no token)
- **Terrain:** smooth ellipsoid (no Cesium ion account needed)

### Real 3D terrain (optional)

For elevation (mountains, valleys):

1. Sign up at [cesium.com/ion](https://cesium.com/ion) and create an access token
2. In `script.js`, set `Cesium.Ion.defaultAccessToken = "<your token>";`
3. Replace `terrainProvider: new Cesium.EllipsoidTerrainProvider()` with `await Cesium.createWorldTerrainAsync()` (wrap viewer setup in an `async` function)

The free ion tier has a monthly usage cap but is enough for personal or portfolio use.

## Embedding in Google Sites

Google Sites cannot run custom scripts on a page directly, so host this project first and embed it in an iframe.

**GitHub Pages**

1. Push the repo to GitHub
2. **Settings → Pages** — deploy from the `main` branch, root folder
3. Use the URL GitHub provides (e.g. `https://yourname.github.io/flythrough-map/`)
4. In Google Sites: **Insert → Embed → By URL** — paste that URL

The map, character select, slideshows, and scoring all run inside the iframe.

**Full screen button**

- A **Full screen** button is always visible in the lower-right corner on every screen.
- Click it to enter full screen; click again to exit.
- If the viewport is smaller than 480 × 560 px (whether inside a small iframe or just a small window), the rest of the UI is hidden and a centered prompt with the Full screen button is shown until the user enters full screen.
- When embedding, the parent must allow full screen (`allowfullscreen` or `allow="fullscreen"`). Google Sites **Embed by URL** usually includes this; custom HTML embeds may need it added manually.

## Notes

- CesiumJS: [github.com/CesiumGS/cesium](https://github.com/CesiumGS/cesium) (Apache 2.0)
- Slideshow images come from the Google Sheet's **Images** tab (one photo per row, linked to a location by the `Location` name); add them as in-cell images (`imageCell`) or as `https://` URLs (`imageUrl`)
- If the Sheet is temporarily unreachable, the app may use the last successful load cached in the browser
- To tune `lat` / `lon` values, append `?debug` to the URL (e.g. `http://localhost:8080/?debug`). Map clicks then log coordinates to the browser console via `onCanvasClicked` in `script.js`
