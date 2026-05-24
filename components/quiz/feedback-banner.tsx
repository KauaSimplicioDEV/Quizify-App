import { HomeTheme } from '@/constants/home-theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  correct: boolean;
  pointsEarned: number;
  explanation: string;
  isLast: boolean;
  onNext: () => void;
};

export function FeedbackBanner({ correct, pointsEarned, explanation, isLast, onNext }: Props) {
  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: correct ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)',
          borderColor: correct ? '#22C55E' : '#EF4444',
        },
      ]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{correct ? '✅ Acertou!' : '❌ Não foi dessa vez'}</Text>
        <Text style={[styles.points, { color: correct ? '#86EFAC' : '#FCA5A5' }]}>
          {correct ? `+${pointsEarned}` : '+0'} pts
        </Text>
      </View>
      <Text style={styles.explanation}>{explanation}</Text>
      <Pressable
        onPress={onNext}
        style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1 }]}>
        <Text style={styles.ctaText}>{isLast ? 'Ver resultado' : 'Próxima questão'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 8,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { color: HomeTheme.text, fontSize: 17, fontWeight: '900' },
  points: { fontSize: 16, fontWeight: '900' },
  explanation: { color: HomeTheme.text, fontSize: 14, lineHeight: 20, marginTop: 8 },
  cta: {
    marginTop: 14,
    backgroundColor: HomeTheme.yellow,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: { color: '#0f172a', fontSize: 15, fontWeight: '900' },
});
