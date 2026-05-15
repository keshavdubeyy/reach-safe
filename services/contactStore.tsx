import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { TrustedContact } from '../types/contact';
import { StorageKeys } from '../constants/storageKeys';
import * as Storage from './storage';
import * as ContactsApi from './trustedContactsApi';

interface ContactContextType {
  contacts: TrustedContact[];
  addContact: (contact: Omit<TrustedContact, 'id'>) => void;
  updateContact: (id: string, contact: Partial<TrustedContact>) => void;
  deleteContact: (id: string) => void;
  isLoading: boolean;
}

const defaultContacts: TrustedContact[] = [
  {
    id: '1',
    name: 'Mom',
    phoneNumber: '+91 98765 43210',
    relationship: 'Mother',
    permissionLevel: 'full_guardian',
    receivesSOS: true,
    receivesCommuteUpdates: true,
    priority: 'primary',
  },
  {
    id: '2',
    name: 'Sarah',
    phoneNumber: '+91 98765 43211',
    relationship: 'Best Friend',
    permissionLevel: 'commute_only',
    receivesSOS: false,
    receivesCommuteUpdates: true,
    priority: 'secondary',
  },
];

const ContactContext = createContext<ContactContextType | undefined>(undefined);

// Mock traveller ID for now until Auth is implemented
const MOCK_TRAVELLER_ID = '00000000-0000-0000-0000-000000000000';

export const ContactProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const savedContacts = await Storage.loadJSON<TrustedContact[]>(StorageKeys.TRUSTED_CONTACTS, defaultContacts);
    setContacts(savedContacts);
    setIsLoading(false);
  };

  const persistContacts = async (newContacts: TrustedContact[]) => {
    await Storage.saveJSON(StorageKeys.TRUSTED_CONTACTS, newContacts);
  };

  const addContact = async (contactData: Omit<TrustedContact, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newContact: TrustedContact = { ...contactData, id };
    const updated = [...contacts, newContact];
    setContacts(updated);
    await persistContacts(updated);

    try {
      await ContactsApi.createTrustedContact(MOCK_TRAVELLER_ID, contactData);
    } catch (e) {
      console.log('Supabase sync failed (Contact Add). Working locally.');
    }
  };

  const updateContact = async (id: string, contactData: Partial<TrustedContact>) => {
    const updated = contacts.map(c => (c.id === id ? { ...c, ...contactData } : c));
    setContacts(updated);
    await persistContacts(updated);

    try {
      // In a real app, we'd use the Supabase UUID here
      // For now, this is just a placeholder to show the intent
      await ContactsApi.updateTrustedContact(id, contactData);
    } catch (e) {
      console.log('Supabase sync failed (Contact Update). Working locally.');
    }
  };

  const deleteContact = async (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    await persistContacts(updated);

    try {
      await ContactsApi.deleteTrustedContact(id);
    } catch (e) {
      console.log('Supabase sync failed (Contact Delete). Working locally.');
    }
  };

  return (
    <ContactContext.Provider value={{ contacts, addContact, updateContact, deleteContact, isLoading }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};
