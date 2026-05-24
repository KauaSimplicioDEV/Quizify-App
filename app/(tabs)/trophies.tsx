import { GlassCard } from '@/components/home/glass-card';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { useResponsive } from '@/hooks/use-responsive';
import { type StoredAttempt } from '@/lib/quiz/attempts';
import { getUserAttempts } from '@/lib/quiz/quiz-api';
import { getThemeById, QUIZ_LEVEL_META, type QuizLevel } from '@/lib/quiz/themes';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Tela de Troféus.
 * Mostra histórico recente e marcos desbloqueados (conquistas locais com base
 * nas tentativas registradas).
 */
type Trophy = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
};

function buildTrophies(attempts: StoredAttempt[]): Trophy[] {
  const totalAttempts = attempts.length;
  const bestScore = attempts.reduce((acc, a) => Math.max(acc, a.score), 0);
  const distinctThemes = new Set(attempts.map((a) => a.themeId)).size;
  const anyPerfect = attempts.some((a) => a.correctCount === a.totalQuestions && a.totalQuestions > 0);
  const anyNoHint = attempts.some((a) => !a.llmUsed && a.correctCount >= 8);

  return [
    {
      id: 'first',
      emoji: '🚀',
      title: 'Primeira jogada',
      description: 'Conclua sua primeira tentativa.',
      unlocked: totalAttempts >= 1,
    },
    {
      id: 'curious',
      emoji: '🧭',
      title: 'Curioso',
      description: 'Jogue 3 temas diferentes.',
      unlocked: distinctThemes >= 3,
    },
    {
      id: 'highscore',
      emoji: '⭐',
      title: 'Acerto certeiro',
      description: 'Faça 800+ pontos em uma tentativa.',
      unlocked: bestScore >= 800,
    },
    {
      id: 'perfect',
      emoji: '💯',
      title: 'Sem erros',
      description: 'Acerte todas as 10 questões.',
      unlocked: anyPerfect,
    },
    {
      id: 'nohint',
      emoji: '🧠',
      title: 'Sem ajuda',
      description: 'Faça 8+ acertos sem usar a dica.',
      unlocked: anyNoHint,
    },
    {
      id: 'streak',
      emoji: '🏅',
      title: 'Veterano',
      description: 'Conclua 10 tentativas no total.',
      unlocked: totalAttempts >= 10,
    },
  ];
}

export default function TrophiesScreen() {
  const { scaleFont, trophyCardWidth } = useResponsive();
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      (async () => {
        const list = await getUserAttempts(user.id);
        if (!cancelled) setAttempts(list);
      })();
      return () => {
        cancelled = true;
      };
    }, [user])
  );

  const trophies = useMemo(() => buildTrophies(attempts), [attempts]);
  const unlockedCount = trophies.filter((t) => t.unlocked).length;
  const recent = attempts.slice(0, 5);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />
      <ScreenScroll topExtra={20}>
        <Text style={[styles.title, { fontSize: scaleFont(28) }]}>Troféus</Text>
        <Text style={[styles.sub, { fontSize: scaleFont(14) }]}>
          {unlockedCount} / {trophies.length} desbloqueados
        </Text>

        <View style={styles.grid}>
          {trophies.map((t) => (
            <View
              key={t.id}
              style={[
                styles.card,
                { width: trophyCardWidth },
                !t.unlocked && styles.cardLocked,
              ]}>
              <Text style={[styles.cardEmoji, !t.unlocked && styles.dim]}>
                {t.unlocked ? t.emoji : '🔒'}
              </Text>
              <Text style={[styles.cardTitle, !t.unlocked && styles.dim]} numberOfLines={1}>
                {t.title}
              </Text>
              <Text style={[styles.cardDesc, !t.unlocked && styles.dim]} numberOfLines={2}>
                {t.description}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Histórico recente</Text>
        {recent.length === 0 ? (
          <GlassCard style={{ marginTop: 8 }}>
            <Text style={styles.empty}>Nenhuma tentativa ainda. Bora começar?</Text>
          </GlassCard>
        ) : (
          <View style={{ marginTop: 8 }}>
            {recent.map((a) => {
              const theme = getThemeById(a.themeId);
              const levelLabel =
                a.level === 'mixed'
                  ? '🎲 Mista'
                  : QUIZ_LEVEL_META[a.level as QuizLevel].label;
              const date = new Date(a.finishedAt);
              return (
                <View key={a.id} style={styles.historyRow}>
                  <Text style={styles.historyEmoji}>{theme?.emoji ?? '❔'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle} numberOfLines={1}>
                      {theme?.name ?? '—'} · {levelLabel}
                    </Text>
                    <Text style={styles.historyMeta}>
                      {a.correctCount}/{a.totalQuestions} acertos · {date.toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.historyScore}>{a.score}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScreenScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
  title: { color: HomeTheme.text, fontWeight: '900' },
  sub: { color: HomeTheme.textMuted, marginTop: 8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
    padding: 14,
    alignItems: 'center',
  },
  cardLocked: { opacity: 0.6 },
  cardEmoji: { fontSize: 36, marginBottom: 6 },
  cardTitle: { color: HomeTheme.text, fontSize: 13, fontWeight: '900' },
  cardDesc: { color: HomeTheme.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4, lineHeight: 14 },
  dim: { color: HomeTheme.textMuted },
  sectionTitle: {
    color: HomeTheme.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 24,
    marginBottom: 4,
  },
  empty: { color: HomeTheme.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 8 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
  },
  historyEmoji: { fontSize: 24 },
  historyTitle: { color: HomeTheme.text, fontSize: 14, fontWeight: '800' },
  historyMeta: { color: HomeTheme.textMuted, fontSize: 12, marginTop: 2 },
  historyScore: { color: HomeTheme.yellow, fontSize: 16, fontWeight: '900' },
});
