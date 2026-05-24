import { GlassCard } from '@/components/home/glass-card';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { useQuiz } from '@/contexts/quiz-context';
import { useResponsive } from '@/hooks/use-responsive';
import { confirmAction } from '@/lib/confirm';
import { ATTEMPTS_PER_DAY, type AttemptsStatus } from '@/lib/quiz/attempts';
import { getAttemptsStatus, getUserRankPosition, getUserStats } from '@/lib/quiz/quiz-api';
import { resetTutorial } from '@/lib/tutorial';
import { ONBOARDING_ROUTE } from '@/lib/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Stats = Awaited<ReturnType<typeof getUserStats>>;

export default function ProfileScreen() {
  const { scaleFont } = useResponsive();
  const { user, signOut } = useAuth();
  const { reset: resetQuiz } = useQuiz();
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState<AttemptsStatus | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      (async () => {
        const [s, st, r] = await Promise.all([
          getUserStats(user.id),
          getAttemptsStatus(user.id),
          getUserRankPosition(user.id),
        ]);
        if (cancelled) return;
        setStats(s);
        setStatus(st);
        setRank(r.rank);
      })();
      return () => {
        cancelled = true;
      };
    }, [user])
  );

  if (!user) return null;

  const handleReviewTutorial = async () => {
    await resetTutorial(user.id);
    router.push(ONBOARDING_ROUTE);
  };

  const handleSignOut = () => {
    void (async () => {
      const confirmed = await confirmAction({
        title: 'Sair da conta?',
        message: 'Você precisará informar seu nome novamente para entrar.',
        confirmLabel: 'Sair',
        cancelLabel: 'Cancelar',
        destructive: true,
      });
      if (!confirmed) return;
      resetQuiz();
      await signOut();
    })();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />
      <ScreenScroll topExtra={20}>
        <Text style={[styles.title, { fontSize: scaleFont(28) }]}>Perfil</Text>

        <GlassCard style={{ marginTop: 20 }}>
          <Text style={styles.label}>Jogador</Text>
          <Text style={styles.value}>{user.name}</Text>

          {rank != null ? (
            <Text style={styles.rankTag}>🏆 #{rank} no ranking</Text>
          ) : (
            <Text style={styles.rankTag}>Ainda não pontuou no ranking</Text>
          )}
        </GlassCard>

        <View style={styles.statsRow}>
          <Stat label="Tentativas" value={String(stats?.attempts ?? 0)} />
          <Stat label="Melhor pontuação" value={String(stats?.bestScore ?? 0)} />
          <Stat label="Acertos" value={`${stats?.correctRate ?? 0}%`} />
        </View>

        <GlassCard style={{ marginTop: 16 }}>
          <Text style={styles.label}>Tentativas hoje</Text>
          <Text style={styles.attempts}>
            {status ? `${status.used} / ${status.limit}` : `0 / ${ATTEMPTS_PER_DAY}`}
          </Text>
          <Text style={styles.attemptsHint}>
            Reseta automaticamente à meia-noite.
          </Text>
        </GlassCard>

        <Pressable
          onPress={handleReviewTutorial}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.85 : 1 }]}>
          <Text style={styles.actionText}>↻ Rever tutorial</Text>
        </Pressable>

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOut, { opacity: pressed ? 0.85 : 1 }]}>
          <Text style={styles.signOutText}>Sair da conta</Text>
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
  title: { color: HomeTheme.text, fontWeight: '900' },
  label: { color: HomeTheme.textMuted, fontSize: 13, fontWeight: '600' },
  value: { color: HomeTheme.text, fontSize: 20, fontWeight: '800', marginTop: 4 },
  rankTag: { color: HomeTheme.yellow, fontSize: 13, fontWeight: '800', marginTop: 10 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: HomeTheme.glassBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: { color: HomeTheme.text, fontSize: 18, fontWeight: '900' },
  statLabel: { color: HomeTheme.textMuted, fontSize: 11, marginTop: 4, fontWeight: '700' },
  attempts: { color: HomeTheme.text, fontSize: 22, fontWeight: '900', marginTop: 6 },
  attemptsHint: { color: HomeTheme.textMuted, fontSize: 12, marginTop: 4 },
  action: {
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HomeTheme.link,
    backgroundColor: 'rgba(34,211,238,0.10)',
    alignItems: 'center',
  },
  actionText: { color: HomeTheme.link, fontWeight: '900', fontSize: 14 },
  signOut: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HomeTheme.coral,
    backgroundColor: 'rgba(255,107,74,0.15)',
  },
  signOutText: { color: HomeTheme.coral, fontSize: 15, fontWeight: '800' },
});
