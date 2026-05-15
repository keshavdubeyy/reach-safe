export type PermissionLevel = 'sos_only' | 'commute_only' | 'full_guardian';

export interface TrustedContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  permissionLevel: PermissionLevel;
  receivesSOS: boolean;
  receivesCommuteUpdates: boolean;
  priority: 'primary' | 'secondary';
}
