import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { useQuiz } from '@/contexts/quiz-context';
import { useResponsive } from '@/hooks/use-responsive';
import { getAttemptsStatus, startQuiz, QuizApiError } from '@/lib/quiz/quiz-api';
import { TABS_ROOT } from '@/lib/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MIN_SPLASH_MS = 750;

/**
 * Splash "Quizify" + carregamento das 10 questões antes do jogo.
 * Substitui a roleta de temas: o assunto vem no texto de cada pergunta.
 */
export default function QuizStartScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { start, reset } = useQuiz();
  const { scaleFont } = useResponsive();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!user || startedRef.current) return;
    startedRef.current = true;

    void (async () => {
      const splashStart = Date.now();
      setErrorMsg(null);

      try {
        const status = await getAttemptsStatus(user.id);
        if (!status.canPlay) {
          setErrorMsg('Você já usou todas as tentativas de hoje.');
          return;
        }

        const { questions, attemptId } = await startQuiz();
        if (questions.length === 0) {
          setErrorMsg('Não foi possível carregar as questões. Tente novamente.');
          return;
        }

        const elapsed = Date.now() - splashStart;
        if (elapsed < MIN_SPLASH_MS) {
          await new Promise((r) => setTimeout(r, MIN_SPLASH_MS - elapsed));
        }

        reset();
        start({ questions, remoteAttemptId: attemptId });
        router.replace('/quiz/play');
      } catch (e) {
        if (e instanceof QuizApiError && e.code === 'unauthorized') {
          setErrorMsg('Sessão expirada. Faça login novamente.');
        } else if (e instanceof QuizApiError && e.code === 'limit_reached') {
          setErrorMsg('Limite de tentativas de hoje atingido.');
        } else {
          setErrorMsg('Não foi possível iniciar o quiz. Tente novamente.');
        }
      }
    })();
  }, [user, start, reset]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />

      <View style={[styles.body, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        <Text style={[styles.logo, { fontSize: scaleFont(56) }]}>Quizify</Text>
        <Text style={[styles.tagline, { fontSize: scaleFont(16) }]}>
          Preparando seu desafio…
        </Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Pressable
              onPress={() => router.replace(TABS_ROOT)}
              style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.85 : 1 }]}>
              <Text style={styles.backBtnText}>Voltar ao início</Text>
            </Pressable>
          </View>
        ) : (
          <ActivityIndicator size="large" color={HomeTheme.yellow} style={styles.spinner} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    color: HomeTheme.yellow,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 2,
  },
  tagline: {
    color: HomeTheme.textMuted,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  spinner: { marginTop: 36 },
  errorBox: {
    marginTop: 28,
    alignItems: 'center',
    gap: 16,
    maxWidth: 360,
  },
  errorText: {
    color: '#FCA5A5',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: HomeTheme.yellow,
  },
  backBtnText: { color: '#0f172a', fontWeight: '900', fontSize: 15 },
});
