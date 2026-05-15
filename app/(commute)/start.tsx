import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useCommute } from '../../services/commuteStore';
import { useContacts } from '../../services/contactStore';
import { Radius } from '../../constants/radius';

const PREDEFINED_ROUTES = [
  { label: 'Home to Office', from: 'Home', to: 'Office' },
  { label: 'Office to Home', from: 'Office', to: 'Home' },
  { label: 'Home to Metro', from: 'Home', to: 'Metro Station' },
  { label: 'Metro to Home', from: 'Metro Station', to: 'Home' },
];

const TRANSPORT_MODES = ['Cab', 'Rickshaw', 'Walking', 'Transit', 'Driving'];

export default function StartCommuteScreen() {
  const router = useRouter();
  const { startCommute } = useCommute();
  const { contacts } = useContacts();
  const colors = useThemeColor();

  const [selectedRoute, setSelectedRoute] = useState(PREDEFINED_ROUTES[0]);
  const [selectedMode, setSelectedMode] = useState('Cab');
  const [sharingWith, setSharingWith] = useState<string[]>([]);

  const toggleContact = (id: string) => {
    setSharingWith(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleStart = async () => {
    await startCommute({
      routeName: selectedRoute.label,
      from: selectedRoute.from,
      to: selectedRoute.to,
      transportMode: selectedMode,
      selectedTrustedContacts: sharingWith,
      startedAt: Date.now(),
      expectedArrival: Date.now() + 30 * 60 * 1000, // Mock 30 mins
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
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Choose Route</Text>
          <View style={styles.grid}>
            {PREDEFINED_ROUTES.map((route) => (
              <TouchableOpacity
                key={route.label}
                style={[
                  styles.optionCard,
                  { backgroundColor: colors.card },
                  selectedRoute.label === route.label && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedRoute(route)}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{route.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Transport Mode</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeScroll}>
            {TRANSPORT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeChip,
                  { backgroundColor: colors.card },
                  selectedMode === mode && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedMode(mode)}
              >
                <Text style={[
                  styles.modeText,
                  { color: selectedMode === mode ? colors.white : colors.text }
                ]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Share Live Location With</Text>
          <View style={[styles.contactList, { backgroundColor: colors.card }]}>
            {contacts.map((contact, index) => (
              <View key={contact.id}>
                <View style={styles.contactRow}>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                    <Text style={[styles.contactRelationship, { color: colors.textSecondary }]}>{contact.relationship}</Text>
                  </View>
                  <Switch 
                    value={sharingWith.includes(contact.id)} 
                    onValueChange={() => toggleContact(contact.id)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
                {index < contacts.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton title="Go Live Now" onPress={handleStart} />
          <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
            Your live location will be shared with selected contacts until you reach safely.
          </Text>
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
    marginBottom: Spacing.xl,
  },
  backText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    width: 60,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  optionCard: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: Radius.md,
    justifyContent: 'center',
    minHeight: 60,
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  modeScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  modeChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  modeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  contactList: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  contactRelationship: {
    fontSize: Typography.fontSize.xs,
  },
  divider: {
    height: 1,
    opacity: 0.1,
  },
  footer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  disclaimer: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
