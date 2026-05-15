import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Linking, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { StatusCard } from '../components/StatusCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { SOSButton } from '../components/SOSButton';
import { QuickActionCard } from '../components/QuickActionCard';
import { LocationPermissionCard } from '../components/LocationPermissionCard';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { useThemeColor } from '../hooks/use-theme-color';
import * as LocationService from '../services/location';
import { useRouter } from 'expo-router';
import { useCommute } from '../services/commuteStore';
import { useEmergency } from '../services/emergencyStore';
import { useContacts } from '../services/contactStore';
import { MapPreview } from '../components/MapPreview';
import { Radius } from '../constants/radius';

export default function HomeScreen() {
  const router = useRouter();
  const { activeSession, endCommute } = useCommute();
  const { emergency, startCountdown } = useEmergency();
  const { contacts } = useContacts();
  const colors = useThemeColor();

  const [locationStatus, setLocationStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [address, setAddress] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationService.LocationData | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  useEffect(() => {
    if (locationData) {
      LocationService.getAddressFromCoords(locationData.latitude, locationData.longitude).then(setAddress);
    }
  }, [locationData]);

  const checkPermissionStatus = React.useCallback(async () => {
    const status = await LocationService.getLocationPermissionStatus();
    if (status === 'granted') {
      setLocationStatus('granted');
      handleCheckLocation();
    } else {
      setLocationStatus(status === 'denied' ? 'denied' : 'undetermined');
    }
  }, []);

  const handleRequestPermission = async () => {
    if (locationStatus === 'denied') {
      Linking.openSettings();
      return;
    }
    const granted = await LocationService.requestLocationPermission();
    if (granted) {
      setLocationStatus('granted');
      handleCheckLocation();
    } else {
      setLocationStatus('denied');
    }
  };

  const handleCheckLocation = async () => {
    setIsLocationLoading(true);
    const data = await LocationService.getCurrentLocation();
    if (data) {
      setLocationData(data);
    }
    setIsLocationLoading(false);
  };

  const handleStartCommute = () => {
    if (activeSession) {
      router.push('/(commute)/active');
    } else {
      router.push('/(commute)/start');
    }
  };

  const handleReachedSafely = async () => {
    await endCommute();
    Alert.alert('Safe!', 'Your commute has ended and watchers have been notified.');
  };

  const handleSOS = () => {
    startCountdown();
    router.push('/(emergency)/countdown');
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.appName, { color: colors.text }]}>ReachSafe</Text>
        </View>

        <StatusCard 
          status={emergency.status === 'active' ? "EMERGENCY" : (activeSession ? "Commuting" : "Normal")} 
          locationStatus={
            emergency.status === 'active' 
              ? "SOS is active locally"
              : (activeSession ? "Sharing live location" : (locationStatus === 'granted' ? 'Location access ready' : 'Location sharing is off'))
          } 
          contactsCount={contacts.length} 
        />

        {activeSession && (
          <TouchableOpacity 
            style={[styles.activeCommuteCard, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(commute)/active')}
          >
            <View style={styles.activeCommuteHeader}>
              <View style={styles.pulseContainer}>
                <View style={[styles.pulseDot, { backgroundColor: '#FFF' }]} />
                <Text style={[styles.activeCommuteTitle, { color: '#FFF' }]}>Active Commute</Text>
              </View>
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>TAP TO VIEW</Text>
            </View>
            <Text style={[styles.activeCommuteRoute, { color: '#FFF' }]}>{activeSession.routeName}</Text>
            <View style={styles.activeCommuteFooter}>
              <Text style={{ color: '#FFF', opacity: 0.8, fontSize: 12 }}>
                ETA: {new Date(activeSession.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <TouchableOpacity style={styles.reachedButton} onPress={handleReachedSafely}>
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>I REACHED</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        <View style={[styles.locationSection, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleSmall, { color: colors.textSecondary }]}>Your Location</Text>
            <TouchableOpacity onPress={handleCheckLocation} disabled={isLocationLoading}>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>
                {isLocationLoading ? 'UPDATING...' : 'REFRESH'}
              </Text>
            </TouchableOpacity>
          </View>

          {locationData ? (
            <View style={styles.locationContainer}>
              <MapPreview latitude={locationData.latitude} longitude={locationData.longitude} height={180} />
              <View style={styles.addressBox}>
                <Text style={[styles.addressText, { color: colors.text }]} numberOfLines={2}>
                  {address || 'Fetching address...'}
                </Text>
                <Text style={[styles.coordsText, { color: colors.textSecondary }]}>
                  {locationData.latitude.toFixed(5)}, {locationData.longitude.toFixed(5)}
                </Text>
              </View>
            </View>
          ) : (
            <LocationPermissionCard
              status={locationStatus}
              loading={isLocationLoading}
              location={locationData}
              onCheckLocation={handleCheckLocation}
              onRequestPermission={handleRequestPermission}
            />
          )}
        </View>

        <View style={styles.mainAction}>
          <PrimaryButton 
            title={activeSession ? "View Active Commute" : "Start New Commute"} 
            onPress={handleStartCommute} 
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard title="SOS" onPress={handleSOS} isEmergency={true} />
            <QuickActionCard title="Contacts" onPress={() => router.push('/(contacts)')} />
            <QuickActionCard title="History" onPress={() => router.push('/history')} />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.privacyNote, { color: colors.textSecondary }]}>
            Location access is only used during active safety sessions. You are in control.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.floatingSOS}>
        <SOSButton 
          onPress={() => Alert.alert('Emergency', 'Long press to trigger SOS countdown')} 
          onLongPress={handleSOS} 
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.5,
  },
  activeCommuteCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },
  activeCommuteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  activeCommuteTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  activeCommuteRoute: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  activeCommuteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reachedButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  locationSection: {
    marginTop: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitleSmall: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  locationContainer: {
    gap: Spacing.sm,
  },
  addressBox: {
    paddingTop: Spacing.xs,
  },
  addressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
  },
  coordsText: {
    fontSize: 10,
  },
  mainAction: {
    marginTop: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  privacyNote: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    maxWidth: '80%',
    fontStyle: 'italic',
  },
  floatingSOS: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
  },
});
