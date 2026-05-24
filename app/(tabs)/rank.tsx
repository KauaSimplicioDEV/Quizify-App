import { GlassCard } from '@/components/home/glass-card';
import { RankRow } from '@/components/ranking/rank-row';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { useResponsive } from '@/hooks/use-responsive';
import { getTopRanking, getUserRankPosition } from '@/lib/quiz/quiz-api';
import type { RankEntry } from '@/lib/quiz/ranking';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Ranking (R-02): Top 10 com destaque para o usuário atual.
 * Quando o usuário está fora do Top 10, mostramos uma linha "...sua posição".
 */
export default function RankScreen() {
  const { scaleFont } = useResponsive();
  const { user } = useAuth();
  const [top, setTop] = useState<RankEntry[]>([]);
  const [me, setMe] = useState<{ rank: number | null; entry: RankEntry | null; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      (async () => {
        setLoading(true);
        const [list, mine] = await Promise.all([
          getTopRanking(10),
          getUserRankPosition(user.id),
        ]);
        if (cancelled) return;
        setTop(list);
        setMe(mine);
        setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [user])
  );

  const isUserInTop = me?.rank != null && me.rank <= 10;
  const myEntry = me?.entry;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />
      <ScreenScroll topExtra={20}>
        <Text style={[styles.title, { fontSize: scaleFont(28) }]}>Ranking</Text>
        <Text style={[styles.sub, { fontSize: scaleFont(15) }]}>
          Top 10 — melhor pontuação por jogador.
        </Text>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={HomeTheme.link} />
            <Text style={styles.loadingText}>Carregando…</Text>
          </View>
        ) : top.length === 0 ? (
          <GlassCard style={{ marginTop: 20 }}>
            <Text style={styles.empty}>Ninguém pontuou ainda. Seja o primeiro a aparecer aqui!</Text>
          </GlassCard>
        ) : (
          <View style={{ marginTop: 16 }}>
            {top.map((entry, i) => (
              <RankRow
                key={entry.attemptId}
                position={i + 1}
                userName={entry.userName}
                themeId={entry.themeId}
                level={entry.level}
                score={entry.score}
                durationMs={entry.durationMs}
                isCurrentUser={entry.userId === user?.id}
              />
            ))}

            {!isUserInTop && myEntry && me?.rank ? (
              <>
                <Text style={styles.divider}>… sua posição</Text>
                <RankRow
                  position={me.rank}
                  userName={myEntry.userName}
                  themeId={myEntry.themeId}
                  level={myEntry.level}
                  score={myEntry.score}
                  durationMs={myEntry.durationMs}
                  isCurrentUser
                />
              </>
            ) : null}
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
  loading: { marginTop: 30, alignItems: 'center', gap: 10 },
  loadingText: { color: HomeTheme.textMuted, fontSize: 13 },
  empty: { color: HomeTheme.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 12 },
  divider: {
    color: HomeTheme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 14,
    letterSpacing: 1,
  },
});
