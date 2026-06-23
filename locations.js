/**
 * GUIDE - the travel-buddy character who appears at every stop with a
 * short safety lesson. Purely cosmetic data (name + tagline); the avatar
 * art lives in script.js as an inline SVG so there are no extra image
 * files to host. Swap both out together when the Rotaract artwork is ready.
 */
const GUIDE = {
  name: "Red",
  species: "Riding Hood",
  tagline: "Your story guide!"
};

/**
 * LOCATIONS - the tour stops for the flythrough map.
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
 * Edit this array to use your own places. Each entry:
 *   name         - shown as the popup title
 *   description  - shown as the popup body (plain text, keep it short)
 *   lat, lon     - decimal degrees (negative for S / W)
 *   height       - camera viewing range in meters from this location
 *                  (smaller = closer zoom, bigger = wider view)
 *   heading      - compass direction camera faces, in degrees (0 = north). Optional, defaults to 0.
 *   pitch        - camera tilt in degrees (-90 = straight down, 0 = horizon). Optional, defaults to -45.
 *   images       - image URLs shown in the detail popup.
 *   lesson       - Red's safety lesson for this stop:
 *                    title    - short heading for the lesson
 *                    text     - what Red says (keep it short & simple, ages 4-7)
 *                    question - a yes/no style comprehension check
 *                    options  - two choices, each { text, correct, feedback }
 */
const LOCATIONS = [
  {
    name: "Perth, Australia",
    description: "Western Australia's capital, on the Swan River near the Indian Ocean coast.",
    lat: -31.9505,
    lon: 115.8605,
    height: 20000,
    pitch: -35,
    lesson: {
      title: "Your Body Belongs to You",
      text: "Hi, I'm Red! I'll be your story guide on this whole trip. Before we fly off, here's something important to remember: your body belongs to YOU. You get to decide what happens to it - always.",
      question: "Who is the boss of your body?",
      options: [
        { text: "I am!", correct: true, feedback: "That's right! You are always the boss of your own body." },
        { text: "Whoever says so", correct: false, feedback: "Actually, YOU are always the boss of your own body - nobody else decides that for you." }
      ]
    },
    images: [
      "https://plus.unsplash.com/premium_photo-1697729743874-1d9d21ee467d?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1701042038435-834311610eb2?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ]
  },
  {
    id: "2",
    name: "Little Red Riding Hood",
    title: "The Kind-Hearted Adventurer",
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
    name: "Uluru",
    description: "A massive sandstone monolith in the Northern Territory's red centre, sacred to the Anangu people.",
    lat: -25.3444,
    lon: 131.0369,
    height: 8000,
    pitch: -30,
    lesson: {
      title: "Safe Touches & Unsafe Touches",
      text: "Some touches feel warm and happy, like a hug from someone you love. Those are safe touches. But if a touch ever makes your tummy feel funny, scared, or confused, that's an unsafe touch - and it's never okay, even if it's from someone you know.",
      question: "If a touch makes your tummy feel funny or scared, what should you do?",
      options: [
        { text: "Tell a grown-up I trust", correct: true, feedback: "Yes! Telling a grown-up you trust is always the right thing to do." },
        { text: "Keep it a secret", correct: false, feedback: "Actually, it's always best to tell a grown-up you trust - even if someone says to keep it secret." }
      ]
    },
    images: [
      "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?q=80&w=1139&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1654692870756-ea1ebcb8be1d?q=80&w=1124&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ]
  },
  {
    id: "3",
    name: "Phantom of the Opera",
    title: "The Music Keeper",
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
  {
    name: "Sydney Opera House",
    description: "Jorn Utzon's sail-shaped performing arts venue on Sydney Harbour, opened in 1973.",
    lat: -33.8568,
    lon: 151.2153,
    height: 3000,
    pitch: -40,
    lesson: {
      title: "Good Secrets & Worry Secrets",
      text: "A good secret is fun, like a surprise party - it makes you feel excited, and it always turns into something happy. A worry secret is different: it makes your tummy feel funny, and someone tells you not to tell. Worry secrets are the ones you should ALWAYS tell a grown-up.",
      question: "A secret that makes you feel funny or scared is a...",
      options: [
        { text: "Worry secret - tell someone!", correct: true, feedback: "Exactly! Worry secrets should always be told to a grown-up you trust." },
        { text: "Fun surprise", correct: false, feedback: "Not quite - secrets that make you feel funny or scared are worry secrets, and those should always be told." }
      ]
    },
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
    lesson: {
      title: "It's Okay to Say NO",
      text: "\"No\" is one of the most powerful words you know! You can say no to a hug or a touch, even from someone you know and love. Your no matters, and a grown-up who cares about you will always listen to it.",
      question: "Can you say no to a hug, even from someone you know?",
      options: [
        { text: "Yes, always", correct: true, feedback: "That's right! You can always say no, and your no should always be respected." },
        { text: "No, I have to say yes", correct: false, feedback: "Actually, you can always say no to a hug or touch - no matter who is asking." }
      ]
    },
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
    lesson: {
      title: "Watch Out for Tricky Moments",
      text: "Sometimes a grown-up might say something tricky, like \"this is our special secret game.\" That's a warning sign! Someone who truly cares about you will never ask you to keep a secret that makes you feel bad, and you will NEVER get in trouble for telling the truth.",
      question: "If someone says you'll \"get in trouble\" for telling, what's true?",
      options: [
        { text: "I won't get in trouble - it's safe to tell", correct: true, feedback: "Yes! Telling the truth is always safe, and you will never get in trouble for it." },
        { text: "I should never tell", correct: false, feedback: "Actually, it's always safe to tell - you will never get in trouble for telling the truth." }
      ]
    },
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
    lesson: {
      title: "Your Trusted Grown-Ups",
      text: "Everyone needs a few trusted grown-ups - people you can always go to if something feels wrong. That might be a parent, teacher, or another adult who makes you feel safe. And remember: if something bad ever happens, it is NEVER your fault, and telling someone is always brave and right.",
      question: "If something happens that makes you feel bad or scared, whose fault is it?",
      options: [
        { text: "Never mine", correct: true, feedback: "That's exactly right. It is never your fault, and telling a trusted grown-up is always the right thing to do." },
        { text: "Mine", correct: false, feedback: "Actually, it is NEVER your fault. Telling a trusted grown-up is always the right thing to do." }
      ]
    },
    images: [
      "https://images.unsplash.com/photo-1575527048208-6475b441e0a0?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ]
  }
];