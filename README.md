# Location Flythrough Map

A 3D map (CesiumJS) with Next/Prev buttons that fly the camera between a list
of locations, plane-style, with a location-info popup top-right. Free,
no API key required.

## Files

- `index.html` — page structure, loads Cesium from CDN
- `locations.js` — your list of tour stops (edit this)
- `script.js` — camera flyTo logic, popup updates, button handlers
- `style.css` — popup + button styling

## Customizing locations

Open `locations.js` and edit the `LOCATIONS` array. Each entry:

```js
{
  name: "Perth, Australia",
  description: "Short description shown in the popup.",
  lat: -31.9505,
  lon: 115.8605,
  height: 20000,   // camera altitude in meters — lower = closer zoom
  heading: 0,       // optional, compass direction in degrees
  pitch: -35        // optional, camera tilt, -90 = straight down
}
```

Order in the array = order Next/Prev moves through. It wraps around (last →
first, first → last). To get coordinates for a place, right-click it in
Google Maps and copy the lat/lon shown.

## Running it locally

Just open `index.html` in a browser — no build step, no server required.

## Real 3D terrain (optional upgrade)

Right now the globe is smooth (no elevation) so the whole thing works with
zero signup. If you want actual terrain relief (mountains, canyons):

1. Free signup at https://cesium.com/ion
2. Grab an access token from your ion dashboard
3. In `script.js`, set `Cesium.Ion.defaultAccessToken = "<your token>";` near
   the top, and replace the `terrainProvider` line with:
   ```js
   terrainProvider: await Cesium.createWorldTerrainAsync()
   ```
   (this makes `script.js` async — wrap the viewer setup in an `async function`
   and call it, or use a top-level `await` if your hosting supports ES modules)

The free ion tier has a monthly usage cap but it's generous for a
personal/portfolio site.

## Embedding in Google Sites

Google Sites can't run your own `<script>` tags directly on a page, so host
this folder somewhere first, then embed it as an iframe.

**Easiest free host: GitHub Pages**
1. Create a new GitHub repo, push these 4 files to it
2. Repo Settings → Pages → Source: deploy from the `main` branch, root folder
3. GitHub gives you a URL like `https://yourname.github.io/repo-name/`
4. In Google Sites: Insert → Embed → "By URL" → paste that URL → Insert

That's it — the map renders inside Sites in an iframe, buttons and all.

**Alternative:** Sites' Embed feature also lets you paste raw HTML code
directly (Insert → Embed → "Embed code"), which sandboxes it into an iframe
automatically — but external hosting is more reliable for anything beyond a
single file, since `locations.js`/`script.js`/`style.css` need to load as
separate resources.

## Notes

- Arrow keys (← →) also trigger Next/Prev, in addition to the buttons.
- Buttons disable themselves mid-flight so clicks can't overlap/cancel an
  in-progress animation.
- CesiumJS is Apache 2.0 licensed — free for personal and commercial use:
  https://github.com/CesiumGS/cesium
