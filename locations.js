/**
 * LOCATIONS — the tour stops for the flythrough map.
 *
 * Edit this array to use your own places. Each entry:
 *   name         - shown as the popup title
 *   description  - shown as the popup body (plain text, keep it short)
 *   lat, lon     - decimal degrees (negative for S / W)
 *   height       - camera altitude in meters when looking at this location
 *                  (smaller = closer zoom, bigger = wider view)
 *   heading      - compass direction camera faces, in degrees (0 = north). Optional, defaults to 0.
 *   pitch        - camera tilt in degrees (-90 = straight down, 0 = horizon). Optional, defaults to -45.
 */
const LOCATIONS = [
  {
    name: "Perth, Australia",
    description: "Western Australia's capital, on the Swan River near the Indian Ocean coast.",
    lat: -31.9505,
    lon: 115.8605,
    height: 20000,
    pitch: -35
  },
  {
    name: "Uluru",
    description: "A massive sandstone monolith in the Northern Territory's red centre, sacred to the Anangu people.",
    lat: -25.3444,
    lon: 131.0369,
    height: 8000,
    pitch: -30
  },
  {
    name: "Sydney Opera House",
    description: "Jørn Utzon's sail-shaped performing arts venue on Sydney Harbour, opened in 1973.",
    lat: -33.8568,
    lon: 151.2153,
    height: 3000,
    pitch: -40
  },
  {
    name: "Mount Fuji",
    description: "Japan's tallest peak at 3,776 m, an active stratovolcano about 100 km southwest of Tokyo.",
    lat: 35.3606582,
    lon: 138.7067208,
    height: 15000,
    pitch: -25
  },
  {
    name: "Eiffel Tower",
    description: "Gustave Eiffel's iron lattice tower, built in 1889 for the World's Fair, on the Champ de Mars in Paris.",
    lat: 48.8584,
    lon: 2.2945,
    height: 1500,
    pitch: -35
  },
  {
    name: "Grand Canyon",
    description: "A 446 km long gorge carved by the Colorado River in Arizona, up to 1.8 km deep.",
    lat: 36.1069,
    lon: -112.1129,
    height: 12000,
    pitch: -30
  }
];
