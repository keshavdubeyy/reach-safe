import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useCommute } from '../../services/commuteStore';
import { useEmergency } from '../../services/emergencyStore';
import * as LocationService from '../../services/location';
import { Radius } from '../../constants/radius';
import * as NotificationService from '../../services/notification';
import { useContacts } from '../../services/contactStore';
import { MapPreview } from '../../components/MapPreview';

export default function ActiveCommuteScreen() {
  const router = useRouter();
  const { activeSession, updateLocation, endCommute } = useCommute();
  const { startCountdown } = useEmergency();
  const { contacts } = useContacts();
  const colors = useThemeColor();
  const [address, setAddress] = useState<string | null>(null);

  const fetchLocation = React.useCallback(async () => {
    const location = await LocationService.getCurrentLocation();
    if (location) {
      updateLocation(location);
    }
  }, [updateLocation]);

  useEffect(() => {
    if (!activeSession) {
      router.replace('/');
      return;
    }

    fetchLocation();
    const intervalId = setInterval(fetchLocation, 30000);
    return () => clearInterval(intervalId);
  }, [activeSession, fetchLocation, router]);

  useEffect(() => {
    if (activeSession?.latestLocation) {
      LocationService.getAddressFromCoords(
        activeSession.latestLocation.latitude,
        activeSession.latestLocation.longitude
      ).then(setAddress);
    }
  }, [activeSession?.latestLocation]);

  const handleReachedSafely = () => {
    Alert.alert(
      'Reached Safely?',
      'This will notify your watchers and end the session.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, I\'m safe', 
          onPress: async () => {
            await endCommute();
            router.replace('/');
          } 
        }
      ]
    );
  };

  const handleNotifyWatchers = async () => {
    if (!activeSession) return;

    const etaStr = new Date(activeSession.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const message = NotificationService.generateCommuteMessage(
      activeSession.routeName,
      etaStr,
      activeSession.id
    );

    // Get the first selected contact for WhatsApp (in a real app, you might loop or pick primary)
    const firstContactId = activeSession.selectedTrustedContacts[0];
    const contact = contacts.find(c => c.id === firstContactId || c.name === firstContactId);

    if (contact) {
      await NotificationService.sendWhatsAppMessage(contact.phoneNumber, message);
    } else {
      Alert.alert('No Contacts', 'No selected contacts found to notify.');
    }
  };

  const handleSOS = () => {
    startCountdown();
    router.push('/(emergency)/countdown');
  };

  if (!activeSession) return null;

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={[styles.backText, { color: colors.primary }]}>Go Home</Text>
        </TouchableOpacity>
        <View style={styles.statusBadge}>
          <View style={styles.pulseDot} />
          <Text style={[styles.statusText, { color: colors.primary }]}>Commuting</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.mapContainer}>
          {activeSession.latestLocation ? (
            <MapPreview 
              latitude={activeSession.latestLocation.latitude} 
              longitude={activeSession.latestLocation.longitude} 
              height={250}
            />
          ) : (
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.card }]}>
              <Text style={{ color: colors.textSecondary }}>Waiting for location...</Text>
            </View>
          )}
          
          <View style={[styles.addressOverlay, { backgroundColor: colors.card }]}>
            <Text style={[styles.addressTitle, { color: colors.textSecondary }]}>Current Position</Text>
            <Text style={[styles.addressText, { color: colors.text }]} numberOfLines={2}>
              {address || 'Fetching address...'}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.routeHeader}>
            <View style={styles.routePoint}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>From</Text>
              <Text style={[styles.value, { color: colors.text }]}>{activeSession.from}</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={{ color: colors.primary }}>→</Text>
            </View>
            <View style={styles.routePoint}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>To</Text>
              <Text style={[styles.value, { color: colors.text }]}>{activeSession.to}</Text>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.row}>
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Transport</Text>
              <Text style={[styles.value, { color: colors.text }]}>{activeSession.transportMode}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Est. Arrival</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {new Date(activeSession.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Sharing with</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {activeSession.selectedTrustedContacts.length} trusted contacts notified
          </Text>
          <TouchableOpacity 
            style={[styles.notifyButton, { borderColor: colors.primary }]}
            onPress={handleNotifyWatchers}
          >
            <Text style={[styles.notifyButtonText, { color: colors.primary }]}>NOTIFY NOW VIA WHATSAPP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <PrimaryButton title="I Reached Safely" onPress={handleReachedSafely} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    width: 80,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF15',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  mapContainer: {
    marginBottom: Spacing.xl,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressTitle: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  addressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routePoint: {
    flex: 1,
  },
  arrowContainer: {
    paddingHorizontal: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
    opacity: 0.1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  notifyButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  notifyButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sosButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  sosText: {
    color: '#FFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});
