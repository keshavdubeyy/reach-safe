import { LocationData } from '../services/location';

export type EmergencyStatus = 'idle' | 'countdown' | 'active' | 'resolved';

export interface EmergencyState {
  id: string | null;
  status: EmergencyStatus;
  triggeredAt: number | null;
  resolvedAt: number | null;
  latestLocation: LocationData | null;
  batteryStatus: string | null;
  networkStatus: string | null;
  selectedEmergencyContacts: string[];
  call112Opened: boolean;
}
