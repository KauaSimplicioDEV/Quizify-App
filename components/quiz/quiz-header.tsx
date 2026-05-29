import { HomeTheme } from '@/constants/home-theme';
import { QUIZ_LEVEL_META, type QuizLevel } from '@/lib/quiz/themes';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  /** Nível da questão atual (varia ao longo da tentativa mista). */
  currentLevel: QuizLevel;
  questionIndex: number;
  totalQuestions: number;
  score: number;
};

export function QuizHeader({ currentLevel, questionIndex, totalQuestions, score }: Props) {
  const meta = QUIZ_LEVEL_META[currentLevel];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>Quizify</Text>
        <View style={[styles.pill, { backgroundColor: meta.color + '22', borderColor: meta.color }]}>
          <Text style={styles.pillEmoji}>{meta.emoji}</Text>
          <Text style={styles.pillText}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          Questão {Math.min(questionIndex + 1, totalQuestions)} de {totalQuestions}
        </Text>
        <Text style={styles.score}>{score} pts</Text>
      </View>

      <View style={styles.bar}>
        <View
          style={[
            styles.barFill,
            { width: `${((questionIndex + 1) / totalQuestions) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    color: HomeTheme.yellow,
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  pillEmoji: { fontSize: 14 },
  pillText: { color: HomeTheme.text, fontWeight: '800', fontSize: 12 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  progressText: { color: HomeTheme.textMuted, fontWeight: '700', fontSize: 13 },
  score: { color: HomeTheme.yellow, fontSize: 18, fontWeight: '900' },
  bar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: HomeTheme.yellow,
    borderRadius: 999,
  },
});
