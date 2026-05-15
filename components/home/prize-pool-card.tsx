import { GlassCard } from '@/components/home/glass-card';
import { HomeTheme } from '@/constants/home-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function PrizePoolCard() {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Prêmios do dia</Text>
          <Text style={styles.amount}>550 pts</Text>
          <Text style={styles.desc}>
            Comece com bônus grátis e ganhe recompensas extras já no primeiro quiz.
          </Text>
          <Pressable style={styles.btnWrap}>
            <LinearGradient
              colors={[...HomeTheme.purpleBtn]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btn}>
              <Text style={styles.btnIcon}>🏆</Text>
              <Text style={styles.btnText}>Resgatar 20 pts</Text>
            </LinearGradient>
          </Pressable>
        </View>
        <View style={styles.trophyWrap}>
          <Text style={styles.trophy}>🏆</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  col: { flex: 1, paddingRight: 8 },
  label: { color: HomeTheme.textMuted, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  amount: {
    color: HomeTheme.yellow,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 8,
  },
  desc: { color: HomeTheme.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 14 },
  btnWrap: { alignSelf: 'flex-start', borderRadius: 999, overflow: 'hidden' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  btnIcon: { fontSize: 16 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  trophyWrap: { justifyContent: 'center', alignItems: 'center', width: 88 },
  trophy: { fontSize: 64 },
});
