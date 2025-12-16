// Calculate distance between two coordinates using Haversine formula
// Returns distance in meters
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Find worksites within a given radius
export const findNearbyWorksites = (userLat, userLon, worksites, radiusMeters = 100) => {
  return worksites
    .map(worksite => ({
      ...worksite.toJSON(),
      distance: calculateDistance(
        userLat,
        userLon,
        parseFloat(worksite.latitude),
        parseFloat(worksite.longitude)
      ),
    }))
    .filter(worksite => worksite.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
};

// Get all worksites with distances
export const getWorksitesWithDistances = (userLat, userLon, worksites) => {
  return worksites
    .map(worksite => ({
      ...worksite.toJSON(),
      distance: calculateDistance(
        userLat,
        userLon,
        parseFloat(worksite.latitude),
        parseFloat(worksite.longitude)
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
};
