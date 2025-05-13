export const gameTypes = [
  {
    id: 'historic',
    name: 'Historic Cluj',
    description: 'Discover the historical landmarks of Cluj-Napoca',
    difficulty: 'Medium',
    locations: [
      {
        id: 1,
        name: "Saint Michael's Church",
        description: "Gothic-style Roman Catholic church in the heart of Cluj-Napoca",
        points: 100,
        keywords: ["gothic", "church", "catholic", "saint michael", "medieval", "spire", "tower"]
      },
      {
        id: 2,
        name: "Matthias Corvinus Statue",
        description: "Equestrian statue of King Matthias Corvinus",
        points: 75,
        keywords: ["statue", "equestrian", "king", "matthias", "horse", "bronze"]
      },
      {
        id: 3,
        name: "Union Square",
        description: "Main square of Cluj-Napoca",
        points: 50,
        keywords: ["square", "plaza", "center", "piata unirii", "buildings", "historic"]
      }
    ]
  },
  {
    id: 'cultural',
    name: 'Cultural Venues',
    description: 'Explore the cultural and artistic venues of the city',
    difficulty: 'Easy',
    locations: [
      {
        id: 1,
        name: "Cluj-Napoca National Theatre",
        description: "Neo-baroque style theatre building",
        points: 100,
        keywords: ["theatre", "theater", "opera", "baroque", "performance", "cultural"]
      },
      {
        id: 2,
        name: "Art Museum",
        description: "Banffy Palace housing the Art Museum",
        points: 75,
        keywords: ["museum", "palace", "art", "baroque", "banffy", "exhibition"]
      },
      {
        id: 3,
        name: "Puck Puppet Theatre",
        description: "Famous puppet theatre of Cluj",
        points: 50,
        keywords: ["puppet", "theatre", "theater", "children", "performance"]
      }
    ]
  },
  {
    id: 'modern',
    name: 'Modern Cluj',
    description: 'Capture the contemporary side of Cluj-Napoca',
    difficulty: 'Hard',
    locations: [
      {
        id: 1,
        name: "Central Park Casino",
        description: "Modern building in Central Park",
        points: 100,
        keywords: ["casino", "park", "modern", "glass", "contemporary"]
      },
      {
        id: 2,
        name: "The Office Cluj-Napoca",
        description: "Modern office building complex",
        points: 75,
        keywords: ["office", "business", "modern", "glass", "corporate"]
      },
      {
        id: 3,
        name: "VIVO! Cluj-Napoca",
        description: "Modern shopping mall",
        points: 50,
        keywords: ["mall", "shopping", "modern", "retail", "commercial"]
      }
    ]
  },
  {
    id: 'universities',
    name: 'Academic Cluj',
    description: 'Visit the prestigious university buildings of Cluj-Napoca',
    difficulty: 'Medium',
    locations: [
      {
        id: 1,
        name: "Babeș-Bolyai University Main Building",
        description: "The historic main building of Romania's largest university",
        points: 75,
        keywords: ["university", "academic", "babes-bolyai", "historic", "education", "building", "campus"]
      },
      {
        id: 2,
        name: "University of Medicine and Pharmacy",
        description: "Modern medical university campus",
        points: 75,
        keywords: ["medicine", "university", "medical", "campus", "education", "pharmacy", "academic"]
      },
      {
        id: 3,
        name: "Technical University Library",
        description: "The central library of the Technical University",
        points: 75,
        keywords: ["library", "technical", "university", "books", "academic", "modern", "study"]
      }
    ]
  },
  {
    id: 'parks',
    name: 'Green Spaces',
    description: 'Explore the beautiful parks and gardens of Cluj-Napoca',
    difficulty: 'Easy',
    locations: [
      {
        id: 1,
        name: "Central Park",
        description: "The largest and oldest park in Cluj-Napoca, featuring a lake",
        points: 75,
        keywords: ["park", "central", "lake", "trees", "nature", "green", "recreation"]
      },
      {
        id: 2,
        name: "Botanical Garden",
        description: "Alexandru Borza Botanical Garden with diverse plant collections",
        points: 75,
        keywords: ["botanical", "garden", "plants", "flowers", "greenhouse", "nature", "borza"]
      },
      {
        id: 3,
        name: "Cetățuie Park",
        description: "Hilltop park with panoramic views of Cluj-Napoca",
        points: 75,
        keywords: ["cetatuie", "hill", "panorama", "view", "fortress", "park", "overlook"]
      }
    ]
  },
  {
    id: 'religious',
    name: 'Sacred Places',
    description: 'Visit the diverse religious buildings of Cluj-Napoca',
    difficulty: 'Medium',
    locations: [
      {
        id: 1,
        name: "Orthodox Cathedral",
        description: "The Romanian Orthodox Cathedral featuring Byzantine style",
        points: 80,
        keywords: ["orthodox", "cathedral", "church", "byzantine", "religious", "dome", "christian"]
      },
      {
        id: 2,
        name: "Reformed Church",
        description: "Gothic-style Reformed Church with tall spires",
        points: 80,
        keywords: ["reformed", "church", "gothic", "protestant", "spire", "tower", "religious"]
      },
      {
        id: 3,
        name: "Franciscan Church",
        description: "Historic Franciscan monastery and church",
        points: 80,
        keywords: ["franciscan", "church", "monastery", "catholic", "historic", "religious", "medieval"]
      },
      {
        id: 4,
        name: "Synagogue",
        description: "The Neolog Synagogue of Cluj-Napoca",
        points: 80,
        keywords: ["synagogue", "jewish", "temple", "neolog", "religious", "historic", "dome"]
      }
    ]
  },
  {
    id: 'cafes',
    name: 'Café Culture',
    description: 'Discover the vibrant café scene of Cluj-Napoca',
    difficulty: 'Easy',
    locations: [
      {
        id: 1,
        name: "Koffer",
        description: "Trendy minimalist café with artisanal coffee",
        points: 60,
        keywords: ["cafe", "coffee", "koffer", "hipster", "minimalist", "cups", "barista"]
      },
      {
        id: 2,
        name: "Olivo Café",
        description: "Classic café in the historic center",
        points: 60,
        keywords: ["olivo", "cafe", "coffee", "bistro", "historic", "terrace", "pastry"]
      },
      {
        id: 3,
        name: "Sisters Café",
        description: "Cozy café with homemade desserts",
        points: 60,
        keywords: ["sisters", "cafe", "coffee", "dessert", "cozy", "sweet", "cake"]
      },
      {
        id: 4,
        name: "Meron",
        description: "Modern specialty coffee shop with multiple locations",
        points: 60,
        keywords: ["meron", "coffee", "modern", "specialty", "barista", "trendy", "roastery"]
      },
      {
        id: 5,
        name: "Doamna T",
        description: "Vintage-styled café with tea specialties",
        points: 60,
        keywords: ["doamna", "tea", "vintage", "cafe", "retro", "cozy", "teahouse"]
      }
    ]
  },
  {
    id: 'hidden',
    name: 'Hidden Gems',
    description: 'Find lesser-known but fascinating places in Cluj-Napoca',
    difficulty: 'Hard',
    locations: [
      {
        id: 1,
        name: "Tailors' Bastion",
        description: "Part of the medieval fortification walls",
        points: 125,
        keywords: ["bastion", "tailors", "fortress", "wall", "medieval", "historic", "defense"]
      },
      {
        id: 2,
        name: "Hintz House",
        description: "Historic pharmacy museum",
        points: 125,
        keywords: ["hintz", "pharmacy", "museum", "historic", "medicine", "medieval", "house"]
      },
      {
        id: 3,
        name: "Museum Square",
        description: "Small picturesque square in the old town",
        points: 125,
        keywords: ["museum", "square", "historic", "small", "piata", "old town", "cobblestone"]
      },
      {
        id: 4,
        name: "Telephone Palace",
        description: "Art Deco building from the early 20th century",
        points: 125,
        keywords: ["telephone", "palace", "art deco", "historic", "architecture", "building", "tower"]
      }
    ]
  }
]; 