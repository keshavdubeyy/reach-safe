import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useContacts } from '../../services/contactStore';
import { Radius } from '../../constants/radius';

export default function ContactsListScreen() {
  const router = useRouter();
  const { contacts, deleteContact } = useContacts();
  const colors = useThemeColor();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${name} from your trusted contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteContact(id) }
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Trusted Contacts</Text>
        <TouchableOpacity onPress={() => router.push('/(contacts)/add')}>
          <Text style={[styles.addText, { color: colors.primary }]}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No trusted contacts added yet.
            </Text>
          </View>
        ) : (
          contacts.map(contact => (
            <View key={contact.id} style={[styles.contactCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                  <Text style={[styles.relationship, { color: colors.textSecondary }]}>{contact.relationship}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: contact.priority === 'primary' ? colors.primary + '20' : colors.textSecondary + '20' }]}>
                  <Text style={[styles.priorityText, { color: contact.priority === 'primary' ? colors.primary : colors.textSecondary }]}>
                    {contact.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.details}>
                <Text style={[styles.detailText, { color: colors.text }]}>{contact.phoneNumber}</Text>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Permission: {contact.permissionLevel.replace('_', ' ')}
                </Text>
                <View style={styles.tags}>
                  {contact.receivesSOS && <View style={[styles.tag, { backgroundColor: colors.error + '10' }]}><Text style={[styles.tagText, { color: colors.error }]}>SOS</Text></View>}
                  {contact.receivesCommuteUpdates && <View style={[styles.tag, { backgroundColor: colors.primary + '10' }]}><Text style={[styles.tagText, { color: colors.primary }]}>Commute</Text></View>}
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(contacts)/edit', params: { id: contact.id } })}>
                  <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(contact.id, contact.name)}>
                  <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
  addText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'right',
    width: 60,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    marginTop: Spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
  },
  contactCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  contactName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  relationship: {
    fontSize: Typography.fontSize.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  details: {
    marginBottom: Spacing.md,
  },
  detailText: {
    fontSize: Typography.fontSize.md,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'capitalize',
    marginBottom: Spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#00000005',
    paddingTop: Spacing.md,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
