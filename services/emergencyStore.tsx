import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { EmergencyState, EmergencyStatus } from '../types/emergency';
import { LocationData } from '../services/location';
import { StorageKeys } from '../constants/storageKeys';
import * as Storage from './storage';
import * as EmergencyApi from './emergencyApi';

interface EmergencyContextType {
  emergency: EmergencyState;
  emergencyHistory: EmergencyState[];
  startCountdown: () => void;
  activateEmergency: (location: LocationData | null) => void;
  resolveEmergency: () => void;
  setCall112Opened: (opened: boolean) => void;
  resetEmergency: () => void;
  clearHistory: () => void;
}

const initialEmergencyState: EmergencyState = {
  id: null,
  status: 'idle',
  triggeredAt: null,
  resolvedAt: null,
  latestLocation: null,
  batteryStatus: '85%', // Mock
  networkStatus: 'LTE', // Mock
  selectedEmergencyContacts: ['Mom', 'Dad', 'Sarah'],
  call112Opened: false,
};

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

// Mock traveller ID for now until Auth is implemented
const MOCK_TRAVELLER_ID = '00000000-0000-0000-0000-000000000000';

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [emergency, setEmergency] = useState<EmergencyState>(initialEmergencyState);
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyState[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await Storage.loadJSON<EmergencyState[]>(StorageKeys.EMERGENCY_HISTORY, []);
    setEmergencyHistory(history);
  };

  const startCountdown = () => {
    setEmergency(prev => ({
      ...prev,
      status: 'countdown',
      triggeredAt: Date.now(),
    }));
  };

  const activateEmergency = async (location: LocationData | null) => {
    const id = Math.random().toString(36).substring(7);
    const newEmergency: EmergencyState = {
      ...emergency,
      id,
      status: 'active',
      latestLocation: location,
    };
    setEmergency(newEmergency);
    
    // Save to history immediately as "active"
    const updatedHistory = [newEmergency, ...emergencyHistory];
    setEmergencyHistory(updatedHistory);
    await Storage.saveJSON(StorageKeys.EMERGENCY_HISTORY, updatedHistory);

    try {
      await EmergencyApi.createEmergencyEvent(MOCK_TRAVELLER_ID, newEmergency);
    } catch (e) {
      console.log('Supabase sync failed (SOS Start). Working locally.');
    }
  };

  const resolveEmergency = async () => {
    if (emergency.id) {
      const resolvedAt = Date.now();
      const updatedEmergency: EmergencyState = {
        ...emergency,
        status: 'resolved',
        resolvedAt,
      };
      
      const updatedHistory = emergencyHistory.map(item => 
        item.id === emergency.id ? updatedEmergency : item
      );
      setEmergencyHistory(updatedHistory);
      await Storage.saveJSON(StorageKeys.EMERGENCY_HISTORY, updatedHistory);

      try {
        await EmergencyApi.resolveEmergencyEvent(emergency.id, emergency.call112Opened);
      } catch (e) {
        console.log('Supabase sync failed (SOS Resolve). Working locally.');
      }
    }
  };

  const setCall112Opened = (opened: boolean) => {
    setEmergency(prev => ({
      ...prev,
      call112Opened: opened,
    }));
  };

  const resetEmergency = () => {
    setEmergency(initialEmergencyState);
  };

  const clearHistory = async () => {
    setEmergencyHistory([]);
    await Storage.removeItem(StorageKeys.EMERGENCY_HISTORY);
  };

  return (
    <EmergencyContext.Provider value={{ 
      emergency, 
      emergencyHistory,
      startCountdown, 
      activateEmergency, 
      resolveEmergency, 
      setCall112Opened,
      resetEmergency,
      clearHistory
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
