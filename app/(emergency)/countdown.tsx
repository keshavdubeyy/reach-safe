import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useEmergency } from '../../services/emergencyStore';
import * as LocationService from '../../services/location';
import { Radius } from '../../constants/radius';

export default function SOSCountdownScreen() {
  const router = useRouter();
  const { emergency, activateEmergency, resetEmergency } = useEmergency();
  const colors = useThemeColor();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (emergency.status !== 'countdown') {
      router.replace('/');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerEmergency = async () => {
    const location = await LocationService.getCurrentLocation();
    activateEmergency(location);
    router.replace('/(emergency)/active');
  };

  const handleCancel = () => {
    resetEmergency();
    router.replace('/');
  };

  return (
    <Screen style={{ backgroundColor: colors.error }}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.white }]}>Triggering SOS</Text>
        <Text style={[styles.subtitle, { color: colors.white }]}>
          Hold to cancel or wait for countdown
        </Text>
        
        <View style={styles.countdownContainer}>
          <Text style={[styles.countdownText, { color: colors.white }]}>{timeLeft}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.cancelButton, { backgroundColor: colors.white }]} 
          onPress={handleCancel}
        >
          <Text style={[styles.cancelText, { color: colors.error }]}>Cancel SOS</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    opacity: 0.8,
    marginBottom: Spacing.xxl,
  },
  countdownContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    borderColor: '#FFFFFF40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: Typography.fontWeight.bold,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cancelText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});
