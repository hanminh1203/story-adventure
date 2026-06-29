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
| `locations.js` | Character guides and their tour stops (`CHARACTERS`) |
| `script.js` | Game flow, Cesium viewer, camera flights, slideshow, scoring |
| `style.css` | Screens, HUD, pin panel, details modal, collectibles |
| `assets/` | Character avatars, collectible icons, and background images |

## Customizing characters and locations

Edit the `CHARACTERS` array in `locations.js`. Each character:

```js
{
  id: "1",
  name: "Tjingeling",
  title: "The Latern Traveller",
  avatarUrl: "/assets/avatar-tjingeling.png",
  youtubeId: "y_92xI5zY8g",   // YouTube video ID (the part after ?v=)
  themeColor: "#ffd84d",       // accent for borders, buttons, and HUD
  collectibleImage: "/assets/collectible-lantern.svg",
  collectibleName: "lanterns", // plural label in score and toasts
  collectMessages: ["Great find!", "Nice one!", "Got a lantern!"],
  selectButtonLabel: "Pick me!",
  locations: [ /* tour stops */ ]
}
```

Each location:

```js
{
  name: "Eiffel Tower",
  description: "Short text shown in the pin panel and details modal.",
  lat: 48.8584,
  lon: 2.2945,
  height: 1500,    // camera distance in meters — lower = closer
  heading: 0,      // optional compass direction in degrees (default 0)
  images: [        // slideshow URLs (3–4 recommended)
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ]
}
```

Order in `locations` is the order **Next** / **Previous** follow. To find coordinates, right-click a place in Google Maps and copy lat/lon.

Collectible positions are preset per slide in `script.js` (`COLLECTIBLE_LAYOUTS`); each slide can have up to three items. Collectibles already found in a session are tracked and do not respawn until restart.

## Running locally

No build step. Serve the folder over HTTP so root-relative asset paths (e.g. `/assets/avatar-tjingeling.png`) resolve correctly:

```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080` (or the port shown). Opening `index.html` directly as a `file://` URL may break avatar images because they use absolute paths.

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
- Slideshow images are loaded from external URLs configured in `locations.js`; host your own images if you need offline or long-term stability
- To tune `lat` / `lon` values, append `?debug` to the URL (e.g. `http://localhost:8080/?debug`). Map clicks then log coordinates to the browser console via `onCanvasClicked` in `script.js`
