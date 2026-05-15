import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveJSON = async (key: string, value: any): Promise<boolean> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
    return false;
  }
};

export const loadJSON = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : fallback;
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return fallback;
  }
};

export const removeItem = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`Error removing ${key}:`, e);
    return false;
  }
};

export const clearReachSafeData = async (): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const reachsafeKeys = keys.filter(key => key.startsWith('reachsafe_'));
    await AsyncStorage.multiRemove(reachsafeKeys);
    return true;
  } catch (e) {
    console.error('Error clearing ReachSafe data:', e);
    return false;
  }
};
