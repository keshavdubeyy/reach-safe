import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CommuteProvider } from '../services/commuteStore';
import { EmergencyProvider } from '../services/emergencyStore';
import { ContactProvider } from '../services/contactStore';

export default function RootLayout() {
  return (
    <ContactProvider>
      <EmergencyProvider>
        <CommuteProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
          <StatusBar style="dark" />
        </CommuteProvider>
      </EmergencyProvider>
    </ContactProvider>
  );
}
