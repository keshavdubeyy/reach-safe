import { LocationData } from '../services/location';

export interface CommuteSession {
  id: string;
  routeName: string;
  from: string;
  to: string;
  transportMode: string;
  startedAt: number;
  expectedArrival: number;
  status: 'active' | 'completed';
  selectedTrustedContacts: string[];
  latestLocation: LocationData | null;
  lastUpdatedAt: number | null;
}
