import { AuthHero } from '@/constants/auth-hero-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

const STARS = [
  { t: '6%' as const, l: '10%' as const, s: 3 },
  { t: '12%' as const, l: '78%' as const, s: 2 },
  { t: '22%' as const, l: '45%' as const, s: 2 },
  { t: '8%' as const, l: '55%' as const, s: 4 },
  { t: '34%' as const, l: '12%' as const, s: 2 },
  { t: '40%' as const, l: '88%' as const, s: 3 },
  { t: '52%' as const, l: '30%' as const, s: 2 },
  { t: '58%' as const, l: '70%' as const, s: 4 },
  { t: '68%' as const, l: '8%' as const, s: 2 },
  { t: '72%' as const, l: '92%' as const, s: 3 },
  { t: '18%' as const, l: '92%' as const, s: 2 },
  { t: '82%' as const, l: '40%' as const, s: 3 },
  { t: '88%' as const, l: '18%' as const, s: 2 },
];

export function AuthHeroBackground({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={[...AuthHero.gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.gradient}>
      <View style={styles.stars} pointerEvents="none">
        {STARS.map((p, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                top: p.t,
                left: p.l,
                width: p.s,
                height: p.s,
                borderRadius: p.s,
                backgroundColor: AuthHero.star,
              },
            ]}
          />
        ))}
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  stars: { ...StyleSheet.absoluteFillObject },
  star: { position: 'absolute' },
});
