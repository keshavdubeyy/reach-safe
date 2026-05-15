import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { useThemeColor } from '../hooks/use-theme-color';
import { useCommute } from '../services/commuteStore';
import { useEmergency } from '../services/emergencyStore';
import { Radius } from '../constants/radius';
import * as Storage from '../services/storage';

export default function HistoryScreen() {
  const router = useRouter();
  const { commuteHistory, clearHistory: clearCommuteHistory } = useCommute();
  const { emergencyHistory, clearHistory: clearEmergencyHistory } = useEmergency();
  const colors = useThemeColor();

  const handleClearData = () => {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all local commute and emergency logs. Trusted contacts will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear History', 
          style: 'destructive',
          onPress: async () => {
            await clearCommuteHistory();
            await clearEmergencyHistory();
            Alert.alert('Data Cleared', 'Your history has been reset.');
          }
        }
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset Entire App',
      'This will clear ALL data including contacts and settings. Use only for development.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Everything', 
          style: 'destructive',
          onPress: async () => {
            await Storage.clearReachSafeData();
            Alert.alert('App Reset', 'Please restart the app to see changes.');
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>History</Text>
        <TouchableOpacity onPress={handleClearData}>
          <Text style={[styles.clearText, { color: colors.error }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Commute Logs</Text>
          {commuteHistory.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No commutes recorded yet.</Text>
          ) : (
            commuteHistory.map(item => (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.routeName}</Text>
                  <Text style={[styles.itemStatus, { color: colors.primary }]}>{item.status.toUpperCase()}</Text>
                </View>
                <Text style={[styles.itemDate, { color: colors.textSecondary }]}>{formatDate(item.startedAt)}</Text>
                <Text style={[styles.itemDetail, { color: colors.text }]}>via {item.transportMode}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Emergency Logs</Text>
          {emergencyHistory.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No emergency events recorded.</Text>
          ) : (
            emergencyHistory.map(item => (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card, shadowColor: colors.text, borderColor: colors.error, borderWidth: item.status === 'active' ? 1 : 0 }]}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemTitle, { color: colors.error }]}>SOS TRIGGERED</Text>
                  <Text style={[styles.itemStatus, { color: item.status === 'active' ? colors.error : colors.textSecondary }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.itemDate, { color: colors.textSecondary }]}>{formatDate(item.triggeredAt)}</Text>
                {item.call112Opened && (
                  <Text style={[styles.itemDetail, { color: colors.error, fontWeight: 'bold' }]}>112 Dialer Opened</Text>
                )}
                {item.latestLocation && (
                  <Text style={[styles.itemDetail, { color: colors.text }]}>
                    Lat: {item.latestLocation.latitude.toFixed(4)}, Long: {item.latestLocation.longitude.toFixed(4)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleResetApp}>
          <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset All ReachSafe Data</Text>
        </TouchableOpacity>
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
  clearText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'right',
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
  emptyText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  itemCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  itemStatus: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  itemDate: {
    fontSize: Typography.fontSize.xs,
    marginBottom: Spacing.xs,
  },
  itemDetail: {
    fontSize: Typography.fontSize.sm,
  },
  resetButton: {
    marginTop: Spacing.xxl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  resetText: {
    fontSize: Typography.fontSize.xs,
    textDecorationLine: 'underline',
  },
});
