import { HomeHeader } from '@/components/home/home-header';
import { HowItWorksCard } from '@/components/home/how-it-works-card';
import { PlayNowCard } from '@/components/home/play-now-card';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { useQuiz } from '@/contexts/quiz-context';
import { getAttemptsStatus, type AttemptsStatus } from '@/lib/quiz/quiz-api';
import { QUIZ_START_ROUTE } from '@/lib/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const { reset } = useQuiz();
  const [status, setStatus] = useState<AttemptsStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      (async () => {
        const s = await getAttemptsStatus(user.id);
        if (!cancelled) setStatus(s);
      })();
      return () => {
        cancelled = true;
      };
    }, [user])
  );

  if (!user) return null;

  const goToQuiz = () => {
    reset();
    router.push(QUIZ_START_ROUTE);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />
      <ScreenScroll>
        <HomeHeader user={user} />
        <PlayNowCard status={status} onPlay={goToQuiz} />
        <HowItWorksCard />
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
});
