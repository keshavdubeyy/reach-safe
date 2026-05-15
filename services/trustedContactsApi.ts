import { supabase, isSupabaseConfigured } from './supabase';
import { TrustedContact } from '../types/contact';

export const getTrustedContacts = async (travellerId: string) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('traveller_id', travellerId);
  if (error) throw error;
  return data;
};

export const createTrustedContact = async (travellerId: string, contact: Omit<TrustedContact, 'id'>) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('trusted_contacts')
    .insert([{ ...contact, traveller_id: travellerId }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTrustedContact = async (id: string, contact: Partial<TrustedContact>) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('trusted_contacts')
    .update(contact)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTrustedContact = async (id: string) => {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase
    .from('trusted_contacts')
    .delete()
    .eq('id', id);
  if (error) throw error;
};
