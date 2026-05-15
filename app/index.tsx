import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Linking } from 'react-native';
import { Screen } from '../components/Screen';
import { StatusCard } from '../components/StatusCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { SOSButton } from '../components/SOSButton';
import { QuickActionCard } from '../components/QuickActionCard';
import { LocationPermissionCard } from '../components/LocationPermissionCard';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { useThemeColor } from '../hooks/use-theme-color';
import * as LocationService from '../services/location';

import { useRouter } from 'expo-router';
import { useCommute } from '../services/commuteStore';
import { useEmergency } from '../services/emergencyStore';
import { useContacts } from '../services/contactStore';

export default function HomeScreen() {
  const router = useRouter();
  const { activeSession } = useCommute();
  const { emergency, startCountdown } = useEmergency();
  const { contacts } = useContacts();
  const [locationStatus, setLocationStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [locationData, setLocationData] = useState<LocationService.LocationData | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    const status = await LocationService.getLocationPermissionStatus();
    if (status === 'granted') {
      setLocationStatus('granted');
    } else if (status === 'denied') {
      setLocationStatus('denied');
    } else {
      setLocationStatus('undetermined');
    }
  };

  const handleRequestPermission = async () => {
    if (locationStatus === 'denied') {
      Alert.alert(
        'Permission Denied',
        'Please enable location access in your device settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
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
    } else {
      Alert.alert('Error', 'Could not fetch current location. Make sure GPS is enabled.');
    }
    setIsLocationLoading(false);
  };

  const handleStartCommute = () => {
    if (activeSession) {
      router.push('/(commute)/active');
    } else {
      router.push('/(commute)/setup');
    }
  };

  const handleSOS = () => {
    startCountdown();
    router.push('/(emergency)/countdown');
  };

  const handleFakeCall = () => {
    console.log('Fake call triggered');
  };

  const handleShareLocation = () => {
    console.log('Location sharing triggered');
  };

  const colors = useThemeColor();

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.appName, { color: colors.text }]}>ReachSafe</Text>
        </View>

        <StatusCard 
          status={emergency.status === 'active' ? "EMERGENCY" : (activeSession ? "On Commute" : "Normal")} 
          locationStatus={
            emergency.status === 'active' 
              ? "SOS is active locally"
              : (activeSession ? "Updating locally every 30s" : (locationStatus === 'granted' ? 'Location access ready' : 'Location sharing is off'))
          } 
          contactsCount={contacts.length} 
        />

        <LocationPermissionCard
          status={locationStatus}
          loading={isLocationLoading}
          location={locationData}
          onCheckLocation={handleCheckLocation}
          onRequestPermission={handleRequestPermission}
        />

        <View style={styles.mainAction}>
          <PrimaryButton 
            title={activeSession ? "View active commute" : "Start commute"} 
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
            You control when your location is shared. Location access is only used during active safety sessions.
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
  mainAction: {
    marginVertical: Spacing.lg,
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
  },
  floatingSOS: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
  },
});
