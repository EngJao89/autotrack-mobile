import { Stack } from 'expo-router';

export default function VehicleIdLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: 'Detalhe' }} />
      <Stack.Screen name="edit" options={{ title: 'Editar veículo' }} />
    </Stack>
  );
}
