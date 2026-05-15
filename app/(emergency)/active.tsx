import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useEmergency } from '../../services/emergencyStore';
import { useContacts } from '../../services/contactStore';
import { generateEmergencyMessage } from '../../services/emergencyMessage';
import { Radius } from '../../constants/radius';

export default function EmergencyActiveScreen() {
  const router = useRouter();
  const { emergency, resolveEmergency, resetEmergency, setCall112Opened } = useEmergency();
  const { contacts } = useContacts();
  const colors = useThemeColor();

  const sosContacts = contacts.filter(c => c.receivesSOS);
  
  const messagePreview = generateEmergencyMessage({
    travellerName: 'User', // Mock
    latestLocation: emergency.latestLocation,
    batteryStatus: emergency.batteryStatus || 'Unknown',
    networkStatus: emergency.networkStatus || 'Unknown',
    timestamp: emergency.triggeredAt || Date.now(),
  });

  const handleCall112 = async () => {
    try {
      await Linking.openURL('tel:112');
      setCall112Opened(true);
    } catch (error) {
      Alert.alert('Error', 'Could not open dialer. Please call 112 manually.');
    }
  };

  const handleImSafe = () => {
    Alert.alert(
      'Are you safe?',
      'This will end emergency mode and return to Home.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, I\'m safe', 
          onPress: () => {
            resolveEmergency();
            resetEmergency();
            router.replace('/');
          } 
        }
      ]
    );
  };

  if (emergency.status !== 'active') return null;

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={[styles.statusHeader, { backgroundColor: colors.error }]}>
          <Text style={[styles.statusTitle, { color: colors.white }]}>Emergency Mode Active</Text>
          <Text style={[styles.statusSubtitle, { color: colors.white }]}>SOS Triggered Locally</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Location Details</Text>
            {emergency.latestLocation ? (
              <View>
                <View style={styles.locRow}>
                  <Text style={[styles.locLabel, { color: colors.textSecondary }]}>Lat</Text>
                  <Text style={[styles.locValue, { color: colors.text }]}>{emergency.latestLocation.latitude.toFixed(6)}</Text>
                </View>
                <View style={styles.locRow}>
                  <Text style={[styles.locLabel, { color: colors.textSecondary }]}>Long</Text>
                  <Text style={[styles.locValue, { color: colors.text }]}>{emergency.latestLocation.longitude.toFixed(6)}</Text>
                </View>
                <View style={styles.locRow}>
                  <Text style={[styles.locLabel, { color: colors.textSecondary }]}>Accuracy</Text>
                  <Text style={[styles.locValue, { color: colors.text }]}>{emergency.latestLocation.accuracy?.toFixed(1)}m</Text>
                </View>
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary }}>Fetching location...</Text>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Device Status</Text>
            <View style={styles.locRow}>
              <Text style={[styles.locLabel, { color: colors.textSecondary }]}>Battery</Text>
              <Text style={[styles.locValue, { color: colors.text }]}>{emergency.batteryStatus}</Text>
            </View>
            <View style={styles.locRow}>
              <Text style={[styles.locLabel, { color: colors.textSecondary }]}>Network</Text>
              <Text style={[styles.locValue, { color: colors.text }]}>{emergency.networkStatus}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Emergency Message Preview</Text>
            <View style={[styles.messageBox, { backgroundColor: colors.background }]}>
              <Text style={[styles.messageText, { color: colors.text }]}>{messagePreview}</Text>
            </View>
            <Text style={[styles.disclaimerText, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
              This is the message that will be sent to your primary contacts.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Notifying SOS Contacts</Text>
            {sosContacts.length > 0 ? (
              sosContacts.map(contact => (
                <View key={contact.id} style={styles.contactRow}>
                  <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                  <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>{contact.phoneNumber}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.textSecondary }}>No SOS contacts selected.</Text>
            )}
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            In this prototype version, alerts are not sent to contacts yet. This screen prepares the emergency flow locally.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.callButton, { backgroundColor: colors.error }]} onPress={handleCall112}>
            <Text style={[styles.callButtonText, { color: colors.white }]}>Call 112</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.safeButton, { borderColor: colors.border }]} onPress={handleImSafe}>
            <Text style={[styles.safeButtonText, { color: colors.text }]}>I'm safe now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xxl,
  },
  statusHeader: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  statusSubtitle: {
    fontSize: Typography.fontSize.md,
    opacity: 0.9,
  },
  infoSection: {
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  locRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  locLabel: {
    fontSize: Typography.fontSize.sm,
  },
  locValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  messageBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#00000010',
  },
  messageText: {
    fontSize: Typography.fontSize.xs,
    lineHeight: 16,
    fontFamily: 'System',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  contactName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  contactPhone: {
    fontSize: Typography.fontSize.xs,
  },
  disclaimer: {
    marginVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  disclaimerText: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    gap: Spacing.md,
  },
  callButton: {
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  callButtonText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  safeButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    borderWidth: 1,
  },
  safeButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
