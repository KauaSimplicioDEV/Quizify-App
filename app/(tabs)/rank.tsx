import { GlassCard } from '@/components/home/glass-card';
import { HomeTheme } from '@/constants/home-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RankScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />
      <View style={[styles.body, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}>
        <Text style={styles.title}>Ranking</Text>
        <Text style={styles.sub}>Top 10 e a sua posição.</Text>
        <GlassCard style={{ marginTop: 20 }}>
          <Text style={styles.placeholder}>Em breve 📊</Text>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
  body: { flex: 1, paddingHorizontal: 20 },
  title: { color: HomeTheme.text, fontSize: 28, fontWeight: '900' },
  sub: { color: HomeTheme.textMuted, marginTop: 8, fontSize: 15 },
  placeholder: { color: HomeTheme.textMuted, fontSize: 16, textAlign: 'center', paddingVertical: 8 },
});
