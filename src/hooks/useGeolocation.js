import { useState, useEffect, useCallback } from 'react';
import { calculateDistance, checkGeofence } from '../utils/geoUtils';

export function useGeolocation(targetLocation = { lat: 37.4275, lon: -122.1702, radius: 80 }) {
  // Default to a location right inside the CS building
  const [currentPosition, setCurrentPosition] = useState({
    lat: 37.42745,
    lon: -122.17018,
    accuracy: 5, // meters
    isSimulated: true,
  });

  const [simulationMode, setSimulationMode] = useState('inside'); // 'inside' | 'borderline' | 'outside' | 'real'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set position based on preset mode
  const applyPreset = useCallback((mode, target = targetLocation) => {
    setSimulationMode(mode);
    setError(null);

    if (mode === 'inside') {
      // ~12 meters away
      setCurrentPosition({
        lat: target.lat + 0.00008,
        lon: target.lon + 0.00006,
        accuracy: 4,
        isSimulated: true,
      });
    } else if (mode === 'borderline') {
      // ~72 meters away (close to 80m boundary)
      setCurrentPosition({
        lat: target.lat + 0.00055,
        lon: target.lon + 0.00045,
        accuracy: 8,
        isSimulated: true,
      });
    } else if (mode === 'outside') {
      // ~290 meters away
      setCurrentPosition({
        lat: target.lat + 0.0022,
        lon: target.lon + 0.0018,
        accuracy: 12,
        isSimulated: true,
      });
    } else if (mode === 'real') {
      requestRealLocation();
    }
  }, [targetLocation]);

  const requestRealLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          isSimulated: false,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(`Unable to retrieve real GPS: ${err.message}. Defaulting to simulated coordinates.`);
        setIsLoading(false);
        // Fallback to inside preset
        applyPreset('inside');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const geofenceStatus = checkGeofence(
    currentPosition,
    targetLocation,
    targetLocation.radius || 80
  );

  return {
    currentPosition,
    setCurrentPosition,
    simulationMode,
    applyPreset,
    requestRealLocation,
    isLoading,
    error,
    distance: geofenceStatus.distance,
    isWithin: geofenceStatus.inside,
    radius: targetLocation.radius || 80,
  };
}
