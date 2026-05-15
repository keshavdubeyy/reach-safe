import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Radius } from '../constants/radius';

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  height?: number;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ latitude, longitude, height = 200 }) => {
  return (
    <View style={[styles.container, { height }]}>
      <MapView
        // provider={PROVIDER_GOOGLE} // Uncomment for Google Maps
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        region={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
