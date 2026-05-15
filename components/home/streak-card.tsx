import { GlassCard } from '@/components/home/glass-card';
import { HomeTheme } from '@/constants/home-theme';
import { StyleSheet, Text, View } from 'react-native';

export function StreakCard() {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🔥 NO RITMO</Text>
          </View>
          <Text style={styles.days}>15 dias</Text>
          <Text style={styles.sub}>Sequência atual</Text>
        </View>
        <View style={styles.flameCircle}>
          <Text style={styles.flame}>🔥</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 22 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flex: 1 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(91,33,182,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagText: { color: '#F5D0FE', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  days: { color: HomeTheme.yellow, fontSize: 28, fontWeight: '900' },
  sub: { color: HomeTheme.textMuted, fontSize: 13, marginTop: 2 },
  flameCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flame: { fontSize: 32 },
});
