import { supabase, isSupabaseConfigured } from './supabase';
import { EmergencyState } from '../types/emergency';

export const createEmergencyEvent = async (travellerId: string, emergency: EmergencyState) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('emergency_events')
    .insert([{
      traveller_id: travellerId,
      triggered_at: new Date(emergency.triggeredAt || Date.now()).toISOString(),
      latest_latitude: emergency.latestLocation?.latitude,
      latest_longitude: emergency.latestLocation?.longitude,
      selected_contacts: emergency.selectedEmergencyContacts,
      status: 'active'
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const resolveEmergencyEvent = async (eventId: string, call112Opened: boolean) => {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase
    .from('emergency_events')
    .update({ 
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      call_112_opened: call112Opened
    })
    .eq('id', eventId);
  if (error) throw error;
};
