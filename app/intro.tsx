import { ScreenFrame } from '@/components/ui/screen-scroll';
import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { useResponsive } from '@/hooks/use-responsive';
import { AUTH_LOGIN, TABS_ROOT } from '@/lib/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const LOGOS = ['JS', 'TS', 'PY', 'JAVA', 'GO', 'C#', 'PHP', 'SQL', 'SWIFT', 'KOTLIN', 'RUST'];

export default function IntroScreen() {
  const { user } = useAuth();
  const { scaleFont, isTablet } = useResponsive();
  const nextRoute = user ? TABS_ROOT : AUTH_LOGIN;
  const ctaLabel = user ? 'Começar a jogar' : 'Continuar';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />

      <ScreenFrame>
        <View style={[styles.hero, isTablet && styles.heroTablet]}>
          <Text style={[styles.logo, { fontSize: scaleFont(54) }]}>Quizify</Text>
          <Text style={[styles.headline, { fontSize: scaleFont(28), lineHeight: scaleFont(34) }]}>
            Desafie sua mente e ganhe prêmios em dinheiro
          </Text>
          <Text style={[styles.description, { fontSize: scaleFont(15), lineHeight: scaleFont(22) }]}>
            Responda perguntas sobre tecnologia, acerte o máximo possível e suba no ranking para
            conquistar as melhores recompensas.
          </Text>
        </View>

        <View style={[styles.cloud, isTablet && styles.cloudTablet]}>
          {LOGOS.map((item, index) => (
            <View
              key={item}
              style={[
                styles.logoChip,
                isTablet && styles.logoChipTablet,
                index % 3 === 0 ? styles.chipGold : index % 3 === 1 ? styles.chipCyan : styles.chipViolet,
              ]}>
              <Text style={[styles.logoChipText, { fontSize: scaleFont(13) }]}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.replace(nextRoute)}
          style={({ pressed }) => [styles.ctaWrap, { opacity: pressed ? 0.9 : 1 }]}>
          <LinearGradient
            colors={['#14b8a6', '#22d3ee']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cta, isTablet && styles.ctaTablet]}>
            <Text style={[styles.ctaText, { fontSize: scaleFont(18) }]}>{ctaLabel}</Text>
          </LinearGradient>
        </Pressable>
      </ScreenFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
  hero: { marginTop: 30 },
  heroTablet: { marginTop: 48, maxWidth: 640 },
  logo: {
    color: HomeTheme.yellow,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 2,
  },
  headline: {
    marginTop: 12,
    color: '#fff',
    fontWeight: '900',
  },
  description: {
    marginTop: 12,
    color: HomeTheme.textMuted,
    fontWeight: '600',
  },
  cloud: {
    marginTop: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cloudTablet: {
    marginTop: 40,
    gap: 12,
    justifyContent: 'center',
  },
  logoChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  logoChipTablet: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipGold: { backgroundColor: 'rgba(234,179,8,0.22)', borderColor: 'rgba(250,204,21,0.5)' },
  chipCyan: { backgroundColor: 'rgba(34,211,238,0.2)', borderColor: 'rgba(103,232,249,0.5)' },
  chipViolet: { backgroundColor: 'rgba(167,139,250,0.2)', borderColor: 'rgba(196,181,253,0.5)' },
  logoChipText: { color: '#fff', fontWeight: '900', letterSpacing: 0.4 },
  ctaWrap: {
    marginTop: 'auto',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  ctaTablet: {
    paddingVertical: 20,
  },
  ctaText: {
    color: '#082f49',
    fontWeight: '900',
  },
});
