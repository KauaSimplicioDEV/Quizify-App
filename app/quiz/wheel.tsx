import { ThemeWheel } from '@/components/quiz/theme-wheel';
import { ScreenFrame } from '@/components/ui/screen-scroll';
import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { useQuiz } from '@/contexts/quiz-context';
import { useResponsive } from '@/hooks/use-responsive';
import { getAttemptsStatus, startQuiz, type AttemptsStatus, QuizApiError } from '@/lib/quiz/quiz-api';
import type { QuizThemeId } from '@/lib/quiz/themes';
import { TABS_ROOT } from '@/lib/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Tela da roleta (C-01).
 * Sorteia um tema, busca as 10 questões (via API ou banco local) e abre o quiz.
 */
export default function WheelScreen() {
  const { user } = useAuth();
  const { start } = useQuiz();
  const { wheelSize, scaleFont } = useResponsive();
  const [status, setStatus] = useState<AttemptsStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const s = await getAttemptsStatus(user.id);
    setStatus(s);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onPick = useCallback(
    async (themeId: QuizThemeId) => {
      if (!user || loading) return;

      setErrorMsg(null);
      const s = await getAttemptsStatus(user.id);
      if (!s.canPlay) {
        setStatus(s);
        return;
      }

      setLoading(true);
      try {
        const { questions, attemptId } = await startQuiz({ themeId });
        if (questions.length === 0) {
          setErrorMsg('Não foi possível montar 10 questões para este tema.');
          return;
        }
        start({ themeId, questions, remoteAttemptId: attemptId });
        router.replace({ pathname: '/quiz/play' });
      } catch (e) {
        if (e instanceof QuizApiError && e.code === 'unauthorized') {
          setErrorMsg('Sessão expirada. Faça login novamente.');
        } else if (e instanceof QuizApiError && e.code === 'limit_reached') {
          setErrorMsg('Você já jogou todas as tentativas de hoje.');
          await refresh();
        } else {
          setErrorMsg('Não foi possível iniciar o quiz. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    },
    [user, loading, start, refresh]
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />

      <ScreenFrame topExtra={12}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.replace(TABS_ROOT)} style={styles.backBtn}>
            <Text style={[styles.backText, { fontSize: scaleFont(15) }]}>‹ Voltar</Text>
          </Pressable>
          <View style={styles.mixPill}>
            <Text style={[styles.mixText, { fontSize: scaleFont(13) }]}>🎲 Dificuldades mistas</Text>
          </View>
        </View>

        <Text style={[styles.title, { fontSize: scaleFont(26) }]}>Sorteie um tema</Text>
        <Text style={[styles.subtitle, { fontSize: scaleFont(14), lineHeight: scaleFont(20) }]}>
          São 10 questões com mix de dificuldade (4 fáceis · 4 médias · 2 difíceis).
        </Text>

        {status ? (
          <View style={styles.attempts}>
            <Text style={[styles.attemptsText, { fontSize: scaleFont(12) }]}>
              Tentativas hoje: {status.used} / {status.limit}
            </Text>
          </View>
        ) : null}

        <View style={styles.wheelWrap}>
          <ThemeWheel size={wheelSize} onPick={onPick} disabled={loading || !status?.canPlay} />
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={HomeTheme.link} />
            <Text style={[styles.loadingText, { fontSize: scaleFont(13) }]}>
              Preparando suas questões…
            </Text>
          </View>
        ) : null}

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {status && !status.canPlay && !loading ? (
          <View style={styles.warnBox}>
            <Text style={styles.warnText}>
              Você já jogou suas 3 tentativas de hoje. Volte amanhã!
            </Text>
          </View>
        ) : null}
      </ScreenFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 6 },
  backText: { color: HomeTheme.textMuted, fontWeight: '700' },
  mixPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: HomeTheme.link,
    backgroundColor: 'rgba(34,211,238,0.12)',
  },
  mixText: { color: HomeTheme.text, fontWeight: '800' },
  title: { color: HomeTheme.text, fontWeight: '900' },
  subtitle: { color: HomeTheme.textMuted, marginTop: 6, marginBottom: 12 },
  attempts: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    marginBottom: 18,
  },
  attemptsText: { color: HomeTheme.text, fontWeight: '700' },
  wheelWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 320 },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  loadingText: { color: HomeTheme.text, fontWeight: '700' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F87171',
    padding: 12,
    marginTop: 12,
  },
  errorText: { color: '#FCA5A5', textAlign: 'center', fontWeight: '700', fontSize: 13 },
  warnBox: {
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F87171',
    padding: 14,
    marginTop: 12,
  },
  warnText: { color: '#FCA5A5', textAlign: 'center', fontWeight: '700', fontSize: 14 },
});
