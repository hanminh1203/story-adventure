/**
 * LOCATIONS - the tour stops for the flythrough map.
 *
 * Edit this array to use your own places. Each entry:
 *   name         - shown as the popup title
 *   description  - shown as the popup body (plain text, keep it short)
 *   lat, lon     - decimal degrees (negative for S / W)
 *   height       - camera viewing range in meters from this location
 *                  (smaller = closer zoom, bigger = wider view)
 *   heading      - compass direction camera faces, in degrees (0 = north). Optional, defaults to 0.
 *   pitch        - camera tilt in degrees (-90 = straight down, 0 = horizon). Optional, defaults to -45.
 *   images       - image URLs shown in the detail popup.
 */
const LOCATIONS = [
  {
    name: "Perth, Australia",
    description: "Western Australia's capital, on the Swan River near the Indian Ocean coast.",
    lat: -31.9505,
    lon: 115.8605,
    height: 20000,
    pitch: -35,
    images: [
      "https://plus.unsplash.com/premium_photo-1697729743874-1d9d21ee467d?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1701042038435-834311610eb2?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ]
  },
  {
    name: "Uluru",
    description: "A massive sandstone monolith in the Northern Territory's red centre, sacred to the Anangu people.",
    lat: -25.3444,
    lon: 131.0369,
    height: 8000,
    pitch: -30,
    images: [
      "https://source.unsplash.com/900x600/?uluru,australia",
      "https://source.unsplash.com/900x600/?australian-outback"
    ]
  },
  {
    name: "Sydney Opera House",
    description: "Jorn Utzon's sail-shaped performing arts venue on Sydney Harbour, opened in 1973.",
    lat: -33.8568,
    lon: 151.2153,
    height: 3000,
    pitch: -40,
    images: [
      "https://source.unsplash.com/900x600/?sydney-opera-house",
      "https://source.unsplash.com/900x600/?sydney-harbour"
    ]
  },
  {
    name: "Mount Fuji",
    description: "Japan's tallest peak at 3,776 m, an active stratovolcano about 100 km southwest of Tokyo.",
    lat: 35.3606582,
    lon: 138.7067208,
    height: 15000,
    pitch: -25,
    images: [
      "https://source.unsplash.com/900x600/?mount-fuji,japan",
      "https://source.unsplash.com/900x600/?fuji-mountain"
    ]
  },
  {
    name: "Eiffel Tower",
    description: "Gustave Eiffel's iron lattice tower, built in 1889 for the World's Fair, on the Champ de Mars in Paris.",
    lat: 48.8584,
    lon: 2.2945,
    height: 1500,
    pitch: -35,
    images: [
      "https://source.unsplash.com/900x600/?eiffel-tower,paris",
      "https://source.unsplash.com/900x600/?champ-de-mars"
    ]
  },
  {
    name: "Grand Canyon",
    description: "A 446 km long gorge carved by the Colorado River in Arizona, up to 1.8 km deep.",
    lat: 36.1069,
    lon: -112.1129,
    height: 12000,
    pitch: -30,
    images: [
      "https://source.unsplash.com/900x600/?grand-canyon",
      "https://source.unsplash.com/900x600/?colorado-river,canyon"
    ]
  }
];
