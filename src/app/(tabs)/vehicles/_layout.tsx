import { Stack } from 'expo-router';

export default function VehiclesLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: 'Veículos', headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Novo veículo' }} />
      <Stack.Screen name="[vehicleId]" options={{ headerShown: false }} />
    </Stack>
  );
}
