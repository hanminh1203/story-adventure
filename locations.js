/**
 * CHARACTERS - the character guides available for selection.
 *
 * Edit this array to add/modify character guides. Each entry:
 *   id                 - unique identifier (number or string)
 *   name               - character name displayed in the UI
 *   title              - character title/description
 *   avatarUrl          - portrait image path
 *   youtubeId          - YouTube video ID (the part after ?v= in a YouTube URL)
 *   themeColor         - accent color for cards, modals, and speech bubbles
 *   collectibleImage   - icon used for hidden collectibles and score HUD
 *   collectibleName      - plural name for UI copy (e.g. "ducks")
 *   collectMessages    - short messages shown when collecting an item
 *   selectButtonLabel  - CTA on the character select card
 *   locations          - array of tour stops (each may include guideLine)
 */
const CHARACTERS = [
  {
    id: "1",
    name: "Tjingeling",
    title: "The Latern Traveller",
    avatarUrl: "/assets/avatar-tjingeling.png",
    youtubeId: "y_92xI5zY8g",
    themeColor: "#ffd84d",
    collectibleImage: "/assets/collectible-lantern.svg",
    collectibleName: "lanterns",
    collectMessages: ["Great find!", "Nice one!", "Got a lantern!"],
    selectButtonLabel: "Pick me!",
    locations: [
      {
        name: "Eiffel Tower",
        guideLine: "My lantern loves this view — look how Paris sparkles!",
        description: "Gustave Eiffel's iconic iron lattice tower in Paris, built in 1889 for the World's Fair.",
        lat: 48.8584,
        lon: 2.2945,
        height: 1500,
        images: [
          "https://images.unsplash.com/photo-1679231926688-ef9cdab5ed2f?q=80&w=1691&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1775742412601-ae289254efe5?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1604172928641-a0a9f86e708d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1609971757431-439cf7b4141b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Big Ben & Houses of Parliament",
        guideLine: "Hear that chime? London is calling us closer!",
        description: "The iconic clock tower and Gothic Revival Palace of Westminster in London.",
        lat: 51.4975,
        lon: -0.1246,
        height: 1000,
        images: [
          "https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1694475484971-a4b987162fed?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1674738675757-4bfc2b2e1fad?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Venice Grand Canal",
        guideLine: "The water glitters like a thousand tiny lanterns!",
        description: "The main watercourse through Venice, Italy, surrounded by magnificent Renaissance and Byzantine buildings.",
        lat: 45.4375,
        lon: 12.3358,
        height: 800,
        images: [
          "https://plus.unsplash.com/premium_photo-1661963047742-dabc5a735357?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1690494028558-a6f535911993?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1602404451805-40918ce73270?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1603396168176-04127d256c06?q=80&w=1089&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
    themeColor: "#e85a5a",
    collectibleImage: "/assets/collectible-mushroom.svg",
    collectibleName: "mushrooms",
    collectMessages: ["Yummy find!", "Nice one!", "Got a mushroom!"],
    selectButtonLabel: "Pick me!",
    locations: [
      {
        name: "Black Forest, Germany",
        guideLine: "The trees whisper fairy tales — stay close on the path!",
        description: "Ancient fairy-tale forests in southwestern Germany, known for dense woodlands and charming villages.",
        lat: 48.2,
        lon: 8.2,
        height: 3000,
        images: [
          "https://plus.unsplash.com/premium_photo-1666902065441-dc3be5a05928?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1565301660306-29e08751cc53?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1681236182311-e7a090cd83fd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Swiss Alps",
        guideLine: "Snowy peaks and cozy chalets — what a grand adventure!",
        description: "Majestic mountain peaks in Switzerland offering stunning alpine scenery and charming chalets.",
        lat: 46.8,
        lon: 8.2,
        height: 8000,
        images: [
          "https://plus.unsplash.com/premium_photo-1689805586474-e59c51f38254?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1586752488885-6ce47fdfd874?q=80&w=1213&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1517079495967-03aed29f98b5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1590309284223-3946577eb10e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Lake Louise, Canada",
        guideLine: "That turquoise water looks good enough to drink!",
        description: "A glacial lake in Banff National Park, renowned for its turquoise waters and mountain backdrop.",
        lat: 51.426,
        lon: -116.2023,
        height: 5000,
        images: [
          "https://images.unsplash.com/photo-1638848424383-c59f174814ac?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1669047373276-81b918672f5a?q=80&w=1075&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1699759490801-bc66ea966469?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
    themeColor: "#9b7bff",
    collectibleImage: "/assets/collectible-note.svg",
    collectibleName: "music notes",
    collectMessages: ["Bravo!", "Nice one!", "Got a music note!"],
    selectButtonLabel: "Pick me!",
    locations: [
      {
        name: "Sydney Opera House",
        guideLine: "Listen — the sails sing with the harbour breeze!",
        description: "Jorn Utzon's sail-shaped performing arts venue on Sydney Harbour, opened in 1973.",
        lat: -33.8568,
        lon: 151.2153,
        height: 3000,
        images: [
          "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=1633&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1697730224601-a3c867ac1886?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Palais Garnier Opera House, Paris",
        guideLine: "Gold and velvet everywhere — a stage fit for magic!",
        description: "A masterpiece of 19th-century Beaux-Arts architecture, the home of the Opéra Nationale de Paris.",
        lat: 48.872,
        lon: 2.3842,
        height: 1200,
        images: [
          "https://plus.unsplash.com/premium_photo-1717422935330-bfcc0c038672?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1549737371-de8c9c554a25?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1624887965527-b00388a5b38d?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1740320045203-61189594fcbe?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Vienna State Opera",
        guideLine: "Can you hear the orchestra warming up?",
        description: "A Renaissance revival opera house in Vienna, Austria, one of the most prestigious opera venues in the world.",
        lat: 48.2023,
        lon: 16.3698,
        height: 1500,
        images: [
          "https://images.unsplash.com/photo-1709363144029-e01301c3eafd?q=80&w=1075&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1589194379031-6b7606daa33d?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1690131054032-1d7465c6b662?q=80&w=1267&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
    themeColor: "#6dd47e",
    collectibleImage: "/assets/collectible-teacup.svg",
    collectibleName: "teacups",
    collectMessages: ["Curiouser!", "Nice one!", "Got a teacup!"],
    selectButtonLabel: "Pick me!",
    locations: [
      {
        name: "Mount Fuji",
        guideLine: "A giant sleeping under a fluffy cloud hat — curious!",
        description: "Japan's tallest peak at 3,776 m, an active stratovolcano about 100 km southwest of Tokyo.",
        lat: 35.3606582,
        lon: 138.7296,
        height: 15000,
        images: [
          "https://images.unsplash.com/photo-1618278942403-e973260cc425?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1661878091370-4ccb8763756a?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1661914240950-b0124f20a5c1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Arashiyama Bamboo Grove",
        guideLine: "The bamboo sways like it's dancing at a tea party!",
        description: "A magical forest of towering bamboo stalks in Kyoto, Japan, creating an enchanting and dreamlike atmosphere.",
        lat: 35.0137,
        lon: 135.6742,
        height: 2000,
        images: [
          "https://images.unsplash.com/photo-1632923754832-60642c12a7ed?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1702564492961-3643703480c2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://plus.unsplash.com/premium_photo-1661962545285-cfb1b576c4c6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      },
      {
        name: "Angkor Wat, Cambodia",
        guideLine: "Ancient stones hiding secrets — shall we peek inside?",
        description: "The largest religious monument in the world, an ancient temple complex surrounded by lush jungle and mystery.",
        lat: 13.3667,
        lon: 103.8667,
        height: 5000,
        images: [
          "https://images.unsplash.com/photo-1599283787923-51b965a58b05?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1653959864991-c828b72c82a8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1653959956536-0fe87d1c0ac4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1595162419575-d9ff75b9586d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      }
    ]
  }
];
