import { HomeTheme } from '@/constants/home-theme';
import { Stack } from 'expo-router';

export default function QuizLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#050a14' },
      }}>
      <Stack.Screen name="wheel" />
      <Stack.Screen name="play" options={{ gestureEnabled: false }} />
      <Stack.Screen name="result" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
// Mantém HomeTheme aqui para preservar a paleta caso o layout cresça.
void HomeTheme;
