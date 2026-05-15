import { useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';

export function useThemeColor() {
  const theme = useColorScheme() ?? 'light';
  return Colors[theme];
}
