import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useContacts } from '../../services/contactStore';
import { Radius } from '../../constants/radius';
import { PermissionLevel } from '../../types/contact';

export default function AddContactScreen() {
  const router = useRouter();
  const { addContact } = useContacts();
  const colors = useThemeColor();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationship, setRelationship] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('sos_only');
  const [receivesSOS, setReceivesSOS] = useState(true);
  const [receivesCommuteUpdates, setReceivesCommuteUpdates] = useState(false);
  const [priority, setPriority] = useState<'primary' | 'secondary'>('secondary');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = 'Name is required';
    if (!phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!relationship) newErrors.relationship = 'Relationship is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addContact({
      name,
      phoneNumber,
      relationship,
      permissionLevel,
      receivesSOS,
      receivesCommuteUpdates,
      priority,
    });
    router.back();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Add Contact</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Basic Information</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
            {errors.name && <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>}
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Phone Number"
              placeholderTextColor={colors.textSecondary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && <Text style={[styles.errorText, { color: colors.error }]}>{errors.phoneNumber}</Text>}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Relationship (e.g. Mother, Friend)"
              placeholderTextColor={colors.textSecondary}
              value={relationship}
              onChangeText={setRelationship}
            />
            {errors.relationship && <Text style={[styles.errorText, { color: colors.error }]}>{errors.relationship}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Permissions</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <View style={styles.pickerRow}>
              <Text style={[styles.label, { color: colors.text }]}>Level</Text>
              <View style={styles.pickerContainer}>
                {(['sos_only', 'commute_only', 'full_guardian'] as PermissionLevel[]).map(level => (
                  <TouchableOpacity 
                    key={level}
                    style={[
                      styles.pickerItem, 
                      permissionLevel === level && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setPermissionLevel(level)}
                  >
                    <Text style={[
                      styles.pickerItemText, 
                      { color: permissionLevel === level ? colors.white : colors.textSecondary }
                    ]}>
                      {level.split('_')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: colors.text }]}>Receives SOS Alerts</Text>
              <Switch value={receivesSOS} onValueChange={setReceivesSOS} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: colors.text }]}>Receives Commute Updates</Text>
              <Switch value={receivesCommuteUpdates} onValueChange={setReceivesCommuteUpdates} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Priority</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <View style={styles.priorityContainer}>
              {(['primary', 'secondary'] as const).map(p => (
                <TouchableOpacity 
                  key={p}
                  style={[
                    styles.priorityItem, 
                    priority === p && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[
                    styles.priorityItemText, 
                    { color: priority === p ? colors.white : colors.textSecondary }
                  ]}>
                    {p.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={{ marginTop: Spacing.xl }}>
          <PrimaryButton title="Save Contact" onPress={handleSave} />
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
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  inputGroup: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  input: {
    fontSize: Typography.fontSize.md,
    paddingVertical: Spacing.md,
  },
  errorText: {
    fontSize: 10,
    marginBottom: Spacing.xs,
  },
  divider: {
    height: 1,
    opacity: 0.1,
  },
  label: {
    fontSize: Typography.fontSize.md,
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  pickerItem: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: '#00000005',
  },
  pickerItemText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  priorityItem: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: '#00000005',
  },
  priorityItemText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
});
