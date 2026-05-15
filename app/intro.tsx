import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { AUTH_LOGIN, TABS_ROOT } from '@/lib/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGOS = ['JS', 'TS', 'PY', 'JAVA', 'GO', 'C#', 'PHP', 'SQL', 'SWIFT', 'KOTLIN', 'RUST'];

export default function IntroScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const nextRoute = user ? TABS_ROOT : AUTH_LOGIN;
  const ctaLabel = user ? 'Começar a jogar' : 'Continuar';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />

      <View style={[styles.container, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 26 }]}>

        <View style={styles.hero}>
          <Text style={styles.logo}>Quizify</Text>
          <Text style={styles.headline}>Desafie sua mente e ganhe prêmios em dinheiro</Text>
          <Text style={styles.description}>
            Responda perguntas sobre tecnologia, acerte o máximo possível e suba no ranking para conquistar as melhores recompensas.
          </Text>
        </View>

        <View style={styles.cloud}>
          {LOGOS.map((item, index) => (
            <View key={item} style={[styles.logoChip, index % 3 === 0 ? styles.chipGold : index % 3 === 1 ? styles.chipCyan : styles.chipViolet]}>
              <Text style={styles.logoChipText}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.replace(nextRoute)}
          style={({ pressed }) => [styles.ctaWrap, { opacity: pressed ? 0.9 : 1 }]}>
          <LinearGradient colors={['#14b8a6', '#22d3ee']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
  container: { flex: 1, paddingHorizontal: 24 },
  skip: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 6 },
  skipText: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '700' },
  hero: { marginTop: 30 },
  logo: {
    color: HomeTheme.yellow,
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 2,
  },
  headline: {
    marginTop: 12,
    color: '#fff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  description: {
    marginTop: 12,
    color: HomeTheme.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  cloud: {
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  logoChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipGold: { backgroundColor: 'rgba(234,179,8,0.22)', borderColor: 'rgba(250,204,21,0.5)' },
  chipCyan: { backgroundColor: 'rgba(34,211,238,0.2)', borderColor: 'rgba(103,232,249,0.5)' },
  chipViolet: { backgroundColor: 'rgba(167,139,250,0.2)', borderColor: 'rgba(196,181,253,0.5)' },
  logoChipText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 0.4 },
  ctaWrap: {
    marginTop: 'auto',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  ctaText: {
    color: '#082f49',
    fontSize: 18,
    fontWeight: '900',
  },
});
