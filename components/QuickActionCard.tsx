import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { Typography } from '../constants/typography';
import { useThemeColor } from '../hooks/use-theme-color';

interface QuickActionCardProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  isEmergency?: boolean;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, onPress, style, isEmergency }) => {
  const colors = useThemeColor();

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { backgroundColor: colors.card, shadowColor: colors.text },
        isEmergency && { backgroundColor: colors.error + '20' }, // 20% opacity for emergency background
        style
      ]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text, 
        { color: colors.text },
        isEmergency && { color: colors.error }
      ]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    flex: 1,
    marginHorizontal: Spacing.xs,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  text: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
