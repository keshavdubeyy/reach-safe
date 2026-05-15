import { Stack } from 'expo-router';

export default function CommuteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setup" />
      <Stack.Screen name="active" />
    </Stack>
  );
}
