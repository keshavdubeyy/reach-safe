import { supabase, isSupabaseConfigured } from './supabase';
import { CommuteSession } from '../types/commute';
import { LocationData } from './location';

export const createCommuteSession = async (travellerId: string, session: Omit<CommuteSession, 'id' | 'status'>) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('commute_sessions')
    .insert([{
      traveller_id: travellerId,
      route_name: session.routeName,
      from_label: session.from,
      to_label: session.to,
      transport_mode: session.transportMode,
      started_at: new Date(session.startedAt).toISOString(),
      expected_arrival: new Date(session.expectedArrival).toISOString(),
      status: 'active'
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const completeCommuteSession = async (sessionId: string) => {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase
    .from('commute_sessions')
    .update({ 
      status: 'completed',
      ended_at: new Date().toISOString()
    })
    .eq('id', sessionId);
  if (error) throw error;
};

export const addLocationPing = async (travellerId: string, location: LocationData, sessionId?: string, emergencyId?: string) => {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase
    .from('location_pings')
    .insert([{
      traveller_id: travellerId,
      commute_session_id: sessionId,
      emergency_event_id: emergencyId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      created_at: new Date(location.timestamp).toISOString()
    }]);
  if (error) throw error;
};
