import { useAuth } from '@/contexts/auth-context';
import { INTRO_ROUTE } from '@/lib/routes';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export default function Index() {
  const { isLoading } = useAuth();
  const bg = useThemeColor({}, 'background');

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={INTRO_ROUTE} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
