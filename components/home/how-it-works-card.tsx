import { GlassCard } from '@/components/home/glass-card';
import { HomeTheme } from '@/constants/home-theme';
import { StyleSheet, Text, View } from 'react-native';

type Step = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    id: '1',
    icon: '🎯',
    title: 'Escolha um nível',
    description: 'Fácil, Médio ou Difícil — você decide o desafio.',
  },
  {
    id: '2',
    icon: '❓',
    title: 'Responda às perguntas',
    description: 'Cada quiz tem perguntas de múltipla escolha.',
  },
  {
    id: '3',
    icon: '⏱️',
    title: 'Seja rápido',
    description: 'Quanto mais rápido acertar, mais pontos você ganha.',
  },
  {
    id: '4',
    icon: '🏆',
    title: 'Suba no ranking',
    description: 'Acumule pontos e desbloqueie troféus exclusivos.',
  },
];

export function HowItWorksCard() {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Como funciona</Text>
        <Text style={styles.subtitle}>Em 4 passos simples</Text>
      </View>

      <View style={styles.stepsList}>
        {STEPS.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.stepIconWrap}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{index + 1}</Text>
              </View>
            </View>
            <View style={styles.stepTextCol}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 22 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: HomeTheme.text,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: HomeTheme.link,
    fontSize: 12,
    fontWeight: '700',
  },
  stepsList: {
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stepIcon: { fontSize: 22 },
  stepBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: HomeTheme.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '900',
  },
  stepTextCol: { flex: 1, minWidth: 0 },
  stepTitle: {
    color: HomeTheme.text,
    fontSize: 14,
    fontWeight: '800',
  },
  stepDesc: {
    color: HomeTheme.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
