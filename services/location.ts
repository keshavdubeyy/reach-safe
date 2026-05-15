import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

let lastGeocodedLocation: { latitude: number, longitude: number } | null = null;
let cachedAddress: string | null = null;

export const getAddressFromCoords = async (latitude: number, longitude: number): Promise<string | null> => {
  // Simple distance threshold (approx 100m) to avoid redundant API calls
  if (lastGeocodedLocation) {
    const dist = Math.sqrt(
      Math.pow(latitude - lastGeocodedLocation.latitude, 2) + 
      Math.pow(longitude - lastGeocodedLocation.longitude, 2)
    );
    if (dist < 0.001 && cachedAddress) { // Approx 100m
      return cachedAddress;
    }
  }

  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results.length > 0) {
      const { street, name, city, region } = results[0];
      const addr = `${name || street || ''}, ${city || ''} ${region || ''}`.trim().replace(/^, |, $/g, '') || 'Unknown Location';
      lastGeocodedLocation = { latitude, longitude };
      cachedAddress = addr;
      return addr;
    }
    return null;
  } catch (e: any) {
    if (e.message?.includes('rate limit')) {
      return cachedAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
    console.error('Reverse geocoding failed:', e);
    return null;
  }
};

export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getLocationPermissionStatus = async (): Promise<Location.PermissionStatus> => {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status;
};

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};
