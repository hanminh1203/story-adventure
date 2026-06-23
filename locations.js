/**
 * CHARACTERS - the character guides available for selection.
 *
 * Edit this array to add/modify character guides. Each entry:
 *   id           - unique identifier (number or string)
 *   name         - character name displayed in the UI
 *   title        - character title/description
 *   youtubeId    - YouTube video ID (the part after ?v= in a YouTube URL)
 *   locations    - array of tour stops for this character (3-4 locations each with 3-4 images)
 */
const CHARACTERS = [
  {
    id: "1",
    name: "Tjingeling",
    title: "The Latern Traveller",
    avatarUrl: "/assets/avatar-tjingeling.png",
    youtubeId: "y_92xI5zY8g",
    locations: [
      {
        name: "Eiffel Tower",
        description: "Gustave Eiffel's iconic iron lattice tower in Paris, built in 1889 for the World's Fair.",
        lat: 48.8584,
        lon: 2.2945,
        height: 1500,
        images: [
          "https://images.unsplash.com/photo-1679231926688-ef9cdab5ed2f?q=80&w=1691&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1775742412601-ae289254efe5?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1502629526778-28582ce08e51?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1499856871957-5b8620a32237?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Big Ben & Houses of Parliament",
        description: "The iconic clock tower and Gothic Revival Palace of Westminster in London.",
        lat: 51.4975,
        lon: -0.1246,
        height: 1000,
        images: [
          "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1577720643272-265cd566d6c5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1606903515520-d82ec38ce4ba?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Venice Grand Canal",
        description: "The main watercourse through Venice, Italy, surrounded by magnificent Renaissance and Byzantine buildings.",
        lat: 45.4375,
        lon: 12.3358,
        height: 800,
        images: [
          "https://images.unsplash.com/photo-1552832860-efba6beb0531?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Little Red Riding Hood",
    title: "The Kind-Hearted Adventurer",
    avatarUrl: "/assets/avatar-red-hood.png",
    youtubeId: "qumpgqKRE3M",
    locations: [
      {
        name: "Black Forest, Germany",
        description: "Ancient fairy-tale forests in southwestern Germany, known for dense woodlands and charming villages.",
        lat: 48.2,
        lon: 8.2,
        height: 3000,
        images: [
          "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Swiss Alps",
        description: "Majestic mountain peaks in Switzerland offering stunning alpine scenery and charming chalets.",
        lat: 46.8,
        lon: 8.2,
        height: 8000,
        images: [
          "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Lake Louise, Canada",
        description: "A glacial lake in Banff National Park, renowned for its turquoise waters and mountain backdrop.",
        lat: 51.426,
        lon: -116.2023,
        height: 5000,
        images: [
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Phantom of the Opera",
    title: "The Music Keeper",
    avatarUrl: "/assets/avatar-phantom.png",
    youtubeId: "iU5ZjeFRA8o",
    locations: [
      {
        name: "Sydney Opera House",
        description: "Jorn Utzon's sail-shaped performing arts venue on Sydney Harbour, opened in 1973.",
        lat: -33.8568,
        lon: 151.2153,
        height: 3000,
        images: [
          "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=1633&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Palais Garnier Opera House, Paris",
        description: "A masterpiece of 19th-century Beaux-Arts architecture, the home of the Opéra Nationale de Paris.",
        lat: 48.872,
        lon: 2.3842,
        height: 1200,
        images: [
          "https://images.unsplash.com/photo-1487180144351-b8472da7d491?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1479268572889-56e549c592a7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1494749900547-af556780b723?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Vienna State Opera",
        description: "A Renaissance revival opera house in Vienna, Austria, one of the most prestigious opera venues in the world.",
        lat: 48.2023,
        lon: 16.3698,
        height: 1500,
        images: [
          "https://images.unsplash.com/photo-1514640292656-e0aab8e9f2b6?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1479268572889-56e549c592a7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1487180144351-b8472da7d491?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Alice in Wonderland",
    title: "The Curious Dreamer",
    avatarUrl: "/assets/avatar-alice.png",
    youtubeId: "uAyYzYcDpz0",
    locations: [
      {
        name: "Mount Fuji",
        description: "Japan's tallest peak at 3,776 m, an active stratovolcano about 100 km southwest of Tokyo.",
        lat: 35.3606582,
        lon: 138.7296,
        height: 15000,
        images: [
          "https://images.unsplash.com/photo-1618278942403-e973260cc425?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1661878091370-4ccb8763756a?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1522383507921-0da7b8b5f2a3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1540959375944-7049f642e9f1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Arashiyama Bamboo Grove",
        description: "A magical forest of towering bamboo stalks in Kyoto, Japan, creating an enchanting and dreamlike atmosphere.",
        lat: 35.0137,
        lon: 135.6742,
        height: 2000,
        images: [
          "https://images.unsplash.com/photo-1522383507921-0da7b8b5f2a3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1533398505906-08e0ce8e571f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1564360040-4b4baa5fa82c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Angkor Wat, Cambodia",
        description: "The largest religious monument in the world, an ancient temple complex surrounded by lush jungle and mystery.",
        lat: 13.3667,
        lon: 103.8667,
        height: 5000,
        images: [
          "https://images.unsplash.com/photo-1549144994-42079e27e35a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1564360040-4b4baa5fa82c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1549144994-42079e27e35a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      }
    ]
  }
];
