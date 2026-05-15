import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { Typography } from '../constants/typography';
import { useThemeColor } from '../hooks/use-theme-color';

interface StatusCardProps {
  status: string;
  locationStatus: string;
  contactsCount: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status, locationStatus, contactsCount }) => {
  const colors = useThemeColor();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <View style={styles.header}>
        <View style={styles.statusDot} />
        <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
      </View>
      <Text style={[styles.subText, { color: colors.textSecondary }]}>{locationStatus}</Text>
      <Text style={[styles.subText, { color: colors.textSecondary }]}>{contactsCount} trusted contacts</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    marginVertical: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34C759', // iOS Green
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  subText: {
    fontSize: Typography.fontSize.md,
    marginTop: Spacing.xs,
  },
});
