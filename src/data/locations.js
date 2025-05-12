const locations = [
  {
    id: 1,
    name: "Saint Michael's Church",
    description: "Gothic-style Roman Catholic church in the heart of Cluj-Napoca",
    coordinates: {
      latitude: 46.769379,
      longitude: 23.589369
    },
    points: 100,
    radius: 50, // meters within which the location is considered valid
    keywords: ["gothic", "church", "catholic", "saint michael", "medieval", "spire", "tower"]
  },
  {
    id: 2,
    name: "Matthias Corvinus Statue",
    description: "Equestrian statue of King Matthias Corvinus",
    coordinates: {
      latitude: 46.769485,
      longitude: 23.589008
    },
    points: 75,
    radius: 30,
    keywords: ["statue", "equestrian", "king", "matthias", "horse", "bronze"]
  },
  {
    id: 3,
    name: "Union Square",
    description: "Main square of Cluj-Napoca",
    coordinates: {
      latitude: 46.769231,
      longitude: 23.589466
    },
    points: 50,
    radius: 100,
    keywords: ["square", "plaza", "center", "piata unirii", "buildings", "historic"]
  },
  {
    id: 4,
    name: "Cluj-Napoca National Theatre",
    description: "Neo-baroque style theatre building",
    coordinates: {
      latitude: 46.769907,
      longitude: 23.591408
    },
    points: 100,
    radius: 50,
    keywords: ["theatre", "theater", "opera", "baroque", "performance", "cultural"]
  },
  {
    id: 5,
    name: "Mirror Street",
    description: "Historic street with symmetrical buildings",
    coordinates: {
      latitude: 46.768871,
      longitude: 23.590559
    },
    points: 75,
    radius: 40,
    keywords: ["mirror", "street", "symmetric", "historic", "buildings", "reflection"]
  }
];

export const getLocationById = (id) => locations.find(loc => loc.id === id);
export const getAllLocations = () => locations;
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // distance in meters
}; 