import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Radius } from '../constants/radius';

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  height?: number;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ height = 200 }) => {
  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.text}>Map preview is only available on mobile devices.</Text>
      <Text style={styles.subtext}>Open ReachSafe on Expo Go to see live maps.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: Radius.lg,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
});
