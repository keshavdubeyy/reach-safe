import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useCommute } from '../../services/commuteStore';
import * as LocationService from '../../services/location';
import { Radius } from '../../constants/radius';

export default function ActiveCommuteScreen() {
  const router = useRouter();
  const { activeSession, updateLocation, endCommute } = useCommute();
  const colors = useThemeColor();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!activeSession) {
      router.replace('/');
      return;
    }

    // Initial update
    fetchLocation();

    // Set up interval for every 30 seconds
    const intervalId = setInterval(() => {
      fetchLocation();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [activeSession]);

  const fetchLocation = async () => {
    setIsUpdating(true);
    const location = await LocationService.getCurrentLocation();
    if (location) {
      updateLocation(location);
    }
    setIsUpdating(false);
  };

  const handleReachedSafely = () => {
    Alert.alert(
      'Reached Safely?',
      'This will end your commute session and stop location sharing.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, I\'m safe', 
          onPress: () => {
            endCommute();
            router.replace('/');
          } 
        }
      ]
    );
  };

  const handleSOS = () => {
    console.log('SOS triggered from Active Commute');
    Alert.alert('SOS Triggered', 'Contacting trusted contacts (Simulated)');
  };

  if (!activeSession) return null;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={[styles.statusText, { color: colors.primary }]}>On commute</Text>
          </View>
        </View>

        <Text style={[styles.sharingNote, { color: colors.textSecondary }]}>
          Location is updating locally on this device every 30s. Live sharing with contacts is not active in this prototype.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Route</Text>
          <Text style={[styles.value, { color: colors.text }]}>{activeSession.routeName}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>ETA</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {new Date(activeSession.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Transport</Text>
              <Text style={[styles.value, { color: colors.text }]}>{activeSession.transportMode}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Live Location (Local)</Text>
          {activeSession.latestLocation ? (
            <View style={styles.locationGrid}>
              <View style={styles.locationItem}>
                <Text style={[styles.locLabel, { color: colors.textSecondary }]}>Lat</Text>
                <Text style={[styles.locValue, { color: colors.text }]}>{activeSession.latestLocation.latitude.toFixed(5)}</Text>
              </View>
              <View style={styles.locationItem}>
                <Text style={[styles.locLabel, { color: colors.textSecondary }]}>Long</Text>
                <Text style={[styles.locValue, { color: colors.text }]}>{activeSession.latestLocation.longitude.toFixed(5)}</Text>
              </View>
              <View style={styles.locationItem}>
                <Text style={[styles.locLabel, { color: colors.textSecondary }]}>Acc</Text>
                <Text style={[styles.locValue, { color: colors.text }]}>{activeSession.latestLocation.accuracy?.toFixed(0)}m</Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.locValue, { color: colors.textSecondary }]}>Fetching location...</Text>
          )}
          
          <View style={styles.updateStatus}>
            {isUpdating && <Text style={[styles.updatingText, { color: colors.primary }]}>Updating...</Text>}
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              Last update: {activeSession.lastUpdatedAt ? new Date(activeSession.lastUpdatedAt).toLocaleTimeString() : 'Never'}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Watchers</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {activeSession.selectedTrustedContacts.join(', ')}
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="I reached safely" onPress={handleReachedSafely} />
          <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  sharingNote: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    fontStyle: 'italic',
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
    marginBottom: Spacing.sm,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#00000005',
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  locationItem: {
    alignItems: 'center',
  },
  locLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  locValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  updateStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  updatingText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  sosButton: {
    backgroundColor: '#FF3B3015',
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginTop: Spacing.sm,
  },
  sosText: {
    color: '#FF3B30',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});
