import { TutorialModal } from '@/components/onboarding/tutorial-modal';
import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { markTutorialSeen } from '@/lib/tutorial';
import { TABS_ROOT } from '@/lib/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Tela do tutorial guiado (O-02). Aberta na primeira sessão pós-identificação
 * (O-01) e quando o usuário escolhe "rever tutorial" (O-03).
 */
export default function OnboardingScreen() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  const finish = useCallback(async () => {
    if (user) await markTutorialSeen(user.id);
    router.replace(TABS_ROOT);
  }, [user]);

  if (!user) return null;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />
      <TutorialModal visible onFinish={finish} onSkip={finish} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
});
