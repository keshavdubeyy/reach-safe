import { LocationData } from './location';

interface EmergencyMessageData {
  travellerName: string;
  latestLocation: LocationData | null;
  batteryStatus: string;
  networkStatus: string;
  timestamp: number;
}

export const generateEmergencyMessage = ({
  travellerName,
  latestLocation,
  batteryStatus,
  networkStatus,
  timestamp,
}: EmergencyMessageData): string => {
  const googleMapsLink = latestLocation 
    ? `https://maps.google.com/?q=${latestLocation.latitude},${latestLocation.longitude}`
    : 'Unknown location';
  
  const timeString = new Date(timestamp).toLocaleTimeString();

  return `SOS ALERT\n\n${travellerName} may need urgent help.\n\nLast known location:\n${googleMapsLink}\n\nBattery: ${batteryStatus}\nNetwork: ${networkStatus}\nLast updated: ${timeString}\n\nPlease call them immediately. If unreachable, call 112.`;
};
