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
  }
]; 