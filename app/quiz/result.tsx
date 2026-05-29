import { ScreenScroll } from '@/components/ui/screen-scroll';
import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { useQuiz } from '@/contexts/quiz-context';
import { useResponsive } from '@/hooks/use-responsive';
import { recordAttempt, submitToRanking, type RemoteAttempt } from '@/lib/quiz/quiz-api';
import { QUIZ_LEVEL_PATTERN } from '@/lib/quiz/questions';
import { maxScoreForLevel } from '@/lib/quiz/scoring';
import { QUIZ_START_ROUTE, TABS_ROOT } from '@/lib/routes';
import type { QuizThemeId } from '@/lib/quiz/themes';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Resultado final da tentativa (G-07 + R-03).
 * - Persiste a tentativa (local ou backend) via `quiz-api`.
 * - Submete ao ranking.
 * - Mostra resumo com mix de dificuldades.
 */
export default function ResultScreen() {
  const insets = useSafeAreaInsets();
  const { scaleFont } = useResponsive();
  const { attempt, reset } = useQuiz();
  const { user } = useAuth();

  const persistedRef = useRef(false);
  const [persisted, setPersisted] = useState<RemoteAttempt | null>(null);
  const [rankPosition, setRankPosition] = useState<number | null>(null);
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    if (!attempt || !user || persistedRef.current) return;
    persistedRef.current = true;

    const correctCount = attempt.answers.filter((a) => a.correct).length;
    const durationMs = Date.now() - attempt.startedAt;

    void (async () => {
      try {
        const sessionThemeId =
          (attempt.questions[0]?.themeId as QuizThemeId | undefined) ?? 'languages';

        const saved = await recordAttempt({
          userId: user.id,
          themeId: sessionThemeId,
          level: 'mixed',
          score: attempt.score,
          correctCount,
          totalQuestions: attempt.questions.length,
          durationMs,
          llmUsed: attempt.llmUsed,
          attemptId: attempt.remoteAttemptId,
        });
        setPersisted(saved);

        const { rank } = await submitToRanking({
          attemptId: saved.id,
          userId: user.id,
          userName: user.name,
          themeId: sessionThemeId,
          level: 'mixed',
          score: attempt.score,
          durationMs,
          finishedAt: saved.finishedAt,
        });
        setRankPosition(rank);
      } finally {
        setSaving(false);
      }
    })();
  }, [attempt, user]);

  /** Pontuação máxima teórica da tentativa, somando o máximo por nível de cada questão. */
  const maxScore = useMemo(() => {
    if (!attempt) return 0;
    return attempt.questions.reduce((acc, q) => acc + maxScoreForLevel(q.level, 1), 0);
  }, [attempt]);

  /** Contagem de cada nível na tentativa atual (para exibição). */
  const breakdown = useMemo(() => {
    const out = { easy: 0, medium: 0, hard: 0 };
    if (!attempt) return out;
    attempt.questions.forEach((q) => {
      out[q.level] += 1;
    });
    return out;
  }, [attempt]);

  if (!attempt || !user) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />
        <View style={[styles.center, { paddingTop: insets.top + 60 }]}>
          <Text style={styles.error}>Nenhuma tentativa para mostrar.</Text>
          <Pressable
            onPress={() => router.replace(TABS_ROOT)}
            style={styles.linkBtn}>
            <Text style={styles.linkBtnText}>Voltar ao início</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const correctCount = attempt.answers.filter((a) => a.correct).length;
  const totalQuestions = attempt.questions.length;
  const accuracyPct = Math.round((correctCount / totalQuestions) * 100);
  const performance =
    attempt.score >= maxScore * 0.85
      ? '🔥 Sensacional!'
      : attempt.score >= maxScore * 0.6
        ? '✨ Bom trabalho!'
        : attempt.score >= maxScore * 0.3
          ? '👏 Continue tentando'
          : '💪 Não desista';

  const handleAgain = () => {
    reset();
    router.replace(QUIZ_START_ROUTE);
  };

  const handleHome = () => {
    reset();
    router.replace(TABS_ROOT);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />

      <ScreenScroll withTabBar={false} topExtra={18}>
        <Text style={[styles.headline, { fontSize: scaleFont(28) }]}>{performance}</Text>
        <Text style={[styles.sub, { fontSize: scaleFont(14) }]}>Resultado da sua tentativa</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Pontuação</Text>
          <Text style={[styles.score, { fontSize: scaleFont(72), lineHeight: scaleFont(78) }]}>
            {attempt.score}
          </Text>
          <Text style={styles.scoreMax}>de até {maxScore} pts</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Acertos" value={`${correctCount}/${totalQuestions}`} />
          <Stat label="Aproveitamento" value={`${accuracyPct}%`} />
          <Stat label="Dica" value={attempt.llmUsed ? 'usada' : 'não usada'} />
        </View>

        <View style={styles.mixBox}>
          <Text style={styles.mixTitle}>Mix da tentativa</Text>
          <Text style={styles.mixRow}>
            🟢 {breakdown.easy} fáceis · 🟡 {breakdown.medium} médias · 🔴 {breakdown.hard} difíceis
          </Text>
          <Text style={styles.mixHint}>{QUIZ_LEVEL_PATTERN.length} questões · assuntos variados</Text>
        </View>

        <View style={styles.rankCard}>
          {saving ? (
            <>
              <ActivityIndicator color={HomeTheme.link} />
              <Text style={styles.rankText}>Atualizando seu ranking…</Text>
            </>
          ) : rankPosition ? (
            <>
              <Text style={styles.rankPos}>#{rankPosition}</Text>
              <Text style={styles.rankText}>Você está no Top 10 global!</Text>
            </>
          ) : (
            <Text style={styles.rankText}>
              {persisted ? 'Boa! Tente novamente para entrar no Top 10.' : 'Não foi possível salvar localmente.'}
            </Text>
          )}
        </View>

        <Pressable
          onPress={handleAgain}
          style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.9 : 1 }]}>
          <Text style={styles.primaryBtnText}>Jogar novamente</Text>
        </Pressable>

        <Pressable
          onPress={handleHome}
          style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.85 : 1 }]}>
          <Text style={styles.secondaryBtnText}>Voltar ao início</Text>
        </Pressable>
      </ScreenScroll>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  error: { color: HomeTheme.text, fontSize: 16, fontWeight: '700' },
  linkBtn: { marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: HomeTheme.yellow },
  linkBtnText: { color: '#0f172a', fontWeight: '900' },
  headline: {
    color: HomeTheme.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 12,
  },
  sub: { color: HomeTheme.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 24, fontSize: 14 },
  scoreCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  scoreLabel: { color: HomeTheme.textMuted, fontSize: 13, fontWeight: '700' },
  score: { color: HomeTheme.yellow, fontWeight: '900' },
  scoreMax: { color: HomeTheme.textMuted, fontSize: 12, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: HomeTheme.glassBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: { color: HomeTheme.text, fontSize: 16, fontWeight: '900' },
  statLabel: { color: HomeTheme.textMuted, fontSize: 11, marginTop: 4, fontWeight: '600' },
  mixBox: {
    marginBottom: 18,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mixTitle: { color: HomeTheme.text, fontWeight: '900', fontSize: 14, marginBottom: 6 },
  mixRow: { color: HomeTheme.text, fontSize: 14, fontWeight: '700' },
  mixHint: { color: HomeTheme.textMuted, fontSize: 12, marginTop: 6 },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(34,211,238,0.10)',
    borderColor: HomeTheme.link,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 18,
  },
  rankPos: { color: HomeTheme.yellow, fontSize: 22, fontWeight: '900' },
  rankText: { color: HomeTheme.text, fontWeight: '700', flex: 1 },
  primaryBtn: {
    backgroundColor: HomeTheme.yellow,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: { color: '#0f172a', fontWeight: '900', fontSize: 16 },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
  },
  secondaryBtnText: { color: HomeTheme.text, fontWeight: '700', fontSize: 14 },
});
