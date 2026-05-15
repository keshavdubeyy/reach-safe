import { Stack } from 'expo-router';

export default function CommuteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="start" />
      <Stack.Screen name="active" />
    </Stack>
  );
}
