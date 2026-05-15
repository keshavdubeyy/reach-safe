import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { Typography } from '../constants/typography';
import { useThemeColor } from '../hooks/use-theme-color';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress }) => {
  const colors = useThemeColor();

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: colors.text }]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: colors.background }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  text: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
});
