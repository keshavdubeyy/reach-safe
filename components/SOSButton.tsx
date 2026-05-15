import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { Typography } from '../constants/typography';
import { Colors } from '../constants/colors';

interface SOSButtonProps {
  onPress: () => void;
  onLongPress?: () => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onPress, onLongPress }) => {
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress} 
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <View style={styles.innerCircle}>
        <Text style={styles.text}>SOS</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3B3020', // Light red outer
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF3B30', // Solid red inner
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});
