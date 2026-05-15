import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Voltar',
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="login" options={{ title: 'Identificação', headerShown: false }} />
    </Stack>
  );
}
