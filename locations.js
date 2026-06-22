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
      "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?q=80&w=1139&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1654692870756-ea1ebcb8be1d?q=80&w=1124&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
      "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=1633&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
      "https://images.unsplash.com/photo-1618278942403-e973260cc425?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1661878091370-4ccb8763756a?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
      "https://images.unsplash.com/photo-1679231926688-ef9cdab5ed2f?q=80&w=1691&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1775742412601-ae289254efe5?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
      "https://images.unsplash.com/photo-1575527048208-6475b441e0a0?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ]
  }
];
