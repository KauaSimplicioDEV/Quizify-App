import { GlassCard } from '@/components/home/glass-card';
import { HomeTheme } from '@/constants/home-theme';
import { useResponsive } from '@/hooks/use-responsive';
import type { AttemptsStatus } from '@/lib/quiz/attempts';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  status: AttemptsStatus | null;
  onPlay: () => void;
};

/** Botão "Jogar" único (G-01) com status de tentativas do dia. */
export function PlayNowCard({ status, onPlay }: Props) {
  const { isTablet, scaleFont } = useResponsive();
  const remaining = status?.remaining ?? 0;
  const limit = status?.limit ?? 3;
  const canPlay = status ? status.canPlay : true;

  return (
    <GlassCard style={styles.card}>
      <View style={[styles.row, isTablet && styles.rowTablet]}>
        <View style={styles.col}>
          <Text style={[styles.eyebrow, { fontSize: scaleFont(11) }]}>Pronto para um desafio?</Text>
          <Text style={[styles.title, { fontSize: scaleFont(24) }]}>Jogar</Text>
          <Text style={[styles.desc, { fontSize: scaleFont(13), lineHeight: scaleFont(18) }]}>
            Responda 10 questões de tecnologia com dificuldades misturadas (4 fáceis · 4 médias · 2
            difíceis).
          </Text>
          {status ? (
            <Text style={[styles.attempts, { fontSize: scaleFont(12) }]}>
              {canPlay
                ? `Tentativas hoje: ${status.used}/${limit} (${remaining} restantes)`
                : 'Você já usou todas as tentativas de hoje.'}
            </Text>
          ) : null}
        </View>

        <View style={[styles.iconWrap, isTablet && styles.iconWrapTablet]}>
          <Text style={[styles.icon, { fontSize: scaleFont(48) }]}>🎯</Text>
        </View>
      </View>

      <Pressable
        onPress={onPlay}
        disabled={!canPlay}
        style={({ pressed }) => [styles.btnWrap, { opacity: pressed ? 0.92 : 1 }]}>
        <LinearGradient
          colors={canPlay ? ['#FFE135', '#F59E0B'] : ['#475569', '#334155']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, isTablet && styles.btnTablet]}>
          <Text style={[styles.btnText, { fontSize: scaleFont(15) }]}>
            {canPlay ? 'Jogar agora' : 'Sem tentativas hoje'}
          </Text>
        </LinearGradient>
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 22 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  rowTablet: { gap: 20 },
  col: { flex: 1 },
  eyebrow: {
    color: HomeTheme.link,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: HomeTheme.text,
    fontWeight: '900',
    marginTop: 2,
  },
  desc: { color: HomeTheme.textMuted, marginTop: 6 },
  attempts: { color: HomeTheme.yellow, marginTop: 8, fontWeight: '800' },
  iconWrap: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapTablet: {
    width: 88,
  },
  icon: {},
  btnWrap: {
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  btn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  btnTablet: {
    paddingVertical: 18,
  },
  btnText: { color: '#0f172a', fontWeight: '900' },
});
