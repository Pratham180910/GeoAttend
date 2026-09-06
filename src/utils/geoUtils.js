/**
 * Geolocation & Geofencing utility functions
 */

/**
 * Calculate distance between two lat/lon points using the Haversine formula
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Format meters to human readable distance (m or km)
 * @param {number} meters 
 * @returns {string}
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Format coordinates to readable string
 * @param {number} lat 
 * @param {number} lon 
 * @returns {string}
 */
export function formatCoordinates(lat, lon) {
  if (lat === undefined || lon === undefined) return 'N/A';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

/**
 * Check if a location is within a specified geofence
 * @param {Object} userLocation { lat, lon }
 * @param {Object} targetLocation { lat, lon }
 * @param {number} radiusMeters 
 * @returns {Object} { inside: boolean, distance: number, diff: number }
 */
export function checkGeofence(userLocation, targetLocation, radiusMeters) {
  if (!userLocation || !targetLocation) {
    return { inside: false, distance: 999999, diff: 999999 };
  }
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lon,
    targetLocation.lat,
    targetLocation.lon
  );
  const inside = distance <= radiusMeters;
  return {
    inside,
    distance,
    diff: distance - radiusMeters,
  };
}
