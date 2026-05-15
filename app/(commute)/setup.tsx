import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useCommute } from '../../services/commuteStore';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/radius';

export default function CommuteSetupScreen() {
  const router = useRouter();
  const { startCommute } = useCommute();
  const colors = useThemeColor();

  const handleStart = () => {
    startCommute({
      routeName: 'Office → Home',
      from: 'Office',
      to: 'Home',
      transportMode: 'Metro + Cab',
      startedAt: Date.now(),
      expectedArrival: Date.now() + 45 * 60 * 1000, // +45 mins
      selectedTrustedContacts: ['Mom', 'Dad', 'Sarah'],
    });
    router.replace('/(commute)/active');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Start Commute</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Route</Text>
          <Text style={[styles.value, { color: colors.text }]}>Office → Home</Text>
          
          <View style={styles.divider} />
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Transport Mode</Text>
          <Text style={[styles.value, { color: colors.text }]}>Metro + Cab</Text>

          <View style={styles.divider} />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Expected Arrival</Text>
          <Text style={[styles.value, { color: colors.text }]}>In 45 minutes</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Sharing With</Text>
          <Text style={[styles.value, { color: colors.text }]}>Mom, Dad, Sarah</Text>
        </View>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Your location will be updated every 30 seconds locally on this device once you start.
        </Text>

        <PrimaryButton title="Start commute" onPress={handleStart} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    width: 50,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: '#00000010',
    marginVertical: Spacing.md,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
});
