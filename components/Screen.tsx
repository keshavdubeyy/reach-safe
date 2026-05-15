import React from 'react';
import { StyleSheet, View, SafeAreaView, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Spacing } from '../constants/spacing';
import { useThemeColor } from '../hooks/use-theme-color';
import { useColorScheme } from 'react-native';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({ children, style }) => {
  const colors = useThemeColor();
  const theme = useColorScheme() ?? 'light';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});
