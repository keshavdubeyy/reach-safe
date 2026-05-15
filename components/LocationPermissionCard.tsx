import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { Typography } from '../constants/typography';
import { LocationData } from '../services/location';
import { useThemeColor } from '../hooks/use-theme-color';

interface LocationPermissionCardProps {
  status: 'undetermined' | 'granted' | 'denied';
  loading: boolean;
  location: LocationData | null;
  onCheckLocation: () => void;
  onRequestPermission: () => void;
}

export const LocationPermissionCard: React.FC<LocationPermissionCardProps> = ({
  status,
  loading,
  location,
  onCheckLocation,
  onRequestPermission,
}) => {
  const colors = useThemeColor();

  const renderContent = () => {
    if (status === 'denied') {
      return (
        <View>
          <Text style={[styles.deniedText, { color: colors.error }]}>
            Location permission is needed only when you choose to start a commute or use SOS.
          </Text>
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: colors.border }]} 
            onPress={onRequestPermission}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Enable in Settings</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === 'undetermined') {
      return (
        <View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Allow location access to enable safety tracking and SOS features.
          </Text>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.text }]} 
            onPress={onRequestPermission}
          >
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>Allow Location</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        {location ? (
          <View style={[styles.locationInfo, { backgroundColor: colors.background }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Latitude:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{location.latitude.toFixed(6)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Longitude:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{location.longitude.toFixed(6)}</Text>
            </View>
            {location.accuracy && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Accuracy:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{location.accuracy.toFixed(1)}m</Text>
              </View>
            )}
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              Last checked: {new Date(location.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ) : (
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>Ready to fetch your current location.</Text>
        )}
        
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.text }]} 
          onPress={onCheckLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>Check my location</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <Text style={[styles.title, { color: colors.text }]}>Location Status</Text>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    marginVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  infoText: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.md,
  },
  deniedText: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  secondaryButton: {
    borderWidth: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  locationInfo: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  value: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.sm,
    textAlign: 'right',
    fontStyle: 'italic',
  },
});
