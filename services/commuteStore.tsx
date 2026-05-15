import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CommuteSession } from '../types/commute';
import { LocationData } from '../services/location';
import { StorageKeys } from '../constants/storageKeys';
import * as Storage from './storage';
import * as CommuteApi from './commuteApi';

interface CommuteContextType {
  activeSession: CommuteSession | null;
  commuteHistory: CommuteSession[];
  startCommute: (session: Omit<CommuteSession, 'id' | 'status' | 'latestLocation' | 'lastUpdatedAt'>) => void;
  endCommute: () => void;
  updateLocation: (location: LocationData) => void;
  clearHistory: () => void;
}

const CommuteContext = createContext<CommuteContextType | undefined>(undefined);

// Mock traveller ID for now until Auth is implemented
const MOCK_TRAVELLER_ID = '00000000-0000-0000-0000-000000000000';

export const CommuteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<CommuteSession | null>(null);
  const [commuteHistory, setCommuteHistory] = useState<CommuteSession[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await Storage.loadJSON<CommuteSession[]>(StorageKeys.COMMUTE_HISTORY, []);
    setCommuteHistory(history);
  };

  const startCommute = async (sessionData: Omit<CommuteSession, 'id' | 'status' | 'latestLocation' | 'lastUpdatedAt'>) => {
    const id = Math.random().toString(36).substring(7);
    const newSession: CommuteSession = {
      ...sessionData,
      id,
      status: 'active',
      latestLocation: null,
      lastUpdatedAt: Date.now(),
    };
    setActiveSession(newSession);

    try {
      await CommuteApi.createCommuteSession(MOCK_TRAVELLER_ID, newSession);
    } catch (e) {
      console.log('Supabase sync failed (Commute Start). Working locally.');
    }
  };

  const endCommute = async () => {
    if (activeSession) {
      const completedSession: CommuteSession = {
        ...activeSession,
        status: 'completed',
        expectedArrival: Date.now(),
      };
      const updatedHistory = [completedSession, ...commuteHistory];
      setCommuteHistory(updatedHistory);
      await Storage.saveJSON(StorageKeys.COMMUTE_HISTORY, updatedHistory);
      
      try {
        await CommuteApi.completeCommuteSession(activeSession.id);
      } catch (e) {
        console.log('Supabase sync failed (Commute End). Working locally.');
      }
      
      setActiveSession(null);
    }
  };

  const updateLocation = async (location: LocationData) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        latestLocation: location,
        lastUpdatedAt: Date.now(),
      };
    });
    
    await Storage.saveJSON(StorageKeys.LAST_KNOWN_LOCATION, location);

    try {
      await CommuteApi.addLocationPing(MOCK_TRAVELLER_ID, location, activeSession?.id);
    } catch (e) {
      // Slient fail for pings to avoid console noise
    }
  };

  const clearHistory = async () => {
    setCommuteHistory([]);
    await Storage.removeItem(StorageKeys.COMMUTE_HISTORY);
  };

  return (
    <CommuteContext.Provider value={{ activeSession, commuteHistory, startCommute, endCommute, updateLocation, clearHistory }}>
      {children}
    </CommuteContext.Provider>
  );
};

export const useCommute = () => {
  const context = useContext(CommuteContext);
  if (context === undefined) {
    throw new Error('useCommute must be used within a CommuteProvider');
  }
  return context;
};
