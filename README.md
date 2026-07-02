# Magical Story Adventures

Interactive educational flythrough game built with React, Vite, and CesiumJS. Players pick a guide character, fly between real-world landmarks on a 3D globe, open each location slideshow, and collect hidden items to build a final score.

The app is content-driven: non-developers can update characters, locations, and photos in Google Sheets, while the frontend reads a Google Apps Script Web App JSON feed.

## What This Project Is

`Magical Story Adventures` is a browser game for guided exploration and storytelling.

- Child-friendly character-driven travel experience
- Real-world places shown on a 3D Cesium globe
- Per-location image slideshow with collectible mini-game
- Scoring and end-of-journey summary
- Content managed externally via Google Sheet + Apps Script

## Architecture At A Glance

### Frontend app

- **Framework:** React 19
- **Build tool:** Vite 6
- **3D renderer:** CesiumJS
- **Main game state hook:** `src/hooks/useGameplay.js`
- **Data loading/normalization:** `src/lib/characterData.js`

### Runtime flow

1. `src/main.jsx` mounts the app.
2. `src/App.jsx` loads character payload from `VITE_CHARACTERS_DATA_URL`.
3. `src/lib/characterData.js` normalizes data and stores cache in `localStorage`.
4. UI moves through stages: `start` -> `characterSelect` -> `gameplay` -> `final`.
5. `useGameplay` orchestrates Cesium viewer, camera movement, slideshow progression, collectibles, tutorial, and scoring.

### Data architecture

- **Google Sheet** (tabs: `Characters`, `Locations`, `Images`) is the source of truth.
- **Apps Script Web App** transforms rows into nested JSON.
- **Frontend** consumes the JSON feed every load.

See:
- `apps-script/README.md`
- `apps-script/SHEET-SCHEMA.md`

## How To Play

1. Launch the game and click **LET'S GO!**
2. Select a guide character.
3. Travel through each destination on the globe.
4. Click **Look closer!** to open the location slideshow.
5. Find and click hidden collectibles in each image.
6. Continue until the final stop.
7. Click **Finalize** to view total score.
8. Click **RESTART** to play again.

### Keyboard controls

- `ArrowRight`: next location or next slideshow image
- `ArrowLeft`: previous location or previous slideshow image
- `Escape`: close modal / exit confirmation
- `Enter`: activate focused button on menu screens

## How To Setup For Local Development

### Prerequisites

- Node.js 20+
- npm
- A deployed Apps Script Web App URL (`.../exec`)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env` in repo root:

```bash
VITE_CHARACTERS_DATA_URL=https://script.google.com/macros/s/your-deployment-id/exec
```

Or copy from `.env.example` and replace the placeholder URL.

### 3) Start local dev server

```bash
npm run dev
```

Default Vite URL is typically `http://localhost:5173`.

## Deployment (Local And On GitHub Pages)

### Local production build validation

Use this before pushing:

```bash
npm run build
npm run preview
```

- Build output is generated in `dist/`.
- `preview` serves production output locally for smoke testing.

### GitHub Pages deployment

Deployment is automated by `.github/workflows/deploy.yml`.

- Trigger branches: `main`, `dev`, and `feature/*`
- Build env in Actions uses secret `CHARACTERS_DATA_URL` as `VITE_CHARACTERS_DATA_URL`
- Publish target is `gh-pages` branch
- Multi-branch page layout is handled by `coderefinery/gh-pages-multibranch`

Required GitHub settings/secrets:

1. Repository secret: `CHARACTERS_DATA_URL` (Apps Script `/exec` endpoint)
2. Pages should serve from `gh-pages` branch

## Data Configuration

### Source of truth

Game content is managed in Google Sheets with exact tab names:

- `Characters`
- `Locations`
- `Images`

Header names must match schema exactly (see `apps-script/SHEET-SCHEMA.md`).

### Apps Script setup

In the sheet:

1. Open **Extensions -> Apps Script**
2. Paste `apps-script/Code.gs`
3. Run `setupTriggers` once and approve permissions
4. Deploy as Web App:
   - Execute as: **Me**
   - Access: **Anyone**
5. Use deployed `/exec` URL in env/secrets

### Important data behavior

- `Locations.name` is geocoded to `latitude` / `longitude` by installable trigger
- `Images.Location` links by exact location `name`
- Row order defines play/slideshow order
- Image cells can be in-cell images or plain URLs
- Empty character avatar/collectible image falls back to default app assets

## Technical Note

- App fetches from `VITE_CHARACTERS_DATA_URL` at runtime.
- If fetch fails, previous successful payload can still be recovered from `localStorage` cache (`charactersCache`) for resilience.
- `vite.config.js` uses `base: "./"` to keep relative asset paths compatible with GitHub Pages branch paths.
- Production/CI uses Node 20 in GitHub Actions.
- Media URL sanitization and shape normalization happen in `src/lib/characterData.js`.

## Critical Handover Items

- Keep Apps Script deployment URL current in both:
  - local `.env` (`VITE_CHARACTERS_DATA_URL`)
  - GitHub secret `CHARACTERS_DATA_URL`
- Re-run `setupTriggers` if trigger permissions are removed or copied to a new sheet.
- Do not rename sheet tabs or headers unless you also update Apps Script parser logic.
- Keep `Locations.name` unique; image/location relationships depend on exact text match.
- Validate data integrity periodically with `validateSheets` in Apps Script.
- Before release: run `npm run build` and `npm run preview`.