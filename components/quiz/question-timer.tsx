import { HomeTheme } from '@/constants/home-theme';
import { MAX_QUESTION_SECONDS } from '@/lib/quiz/scoring';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Cronômetro por questão.
 *
 * - Conta de `MAX_QUESTION_SECONDS` até 0.
 * - Ao zerar, chama `onExpire` (a tela trata como "resposta nula").
 * - `paused` congela a contagem (ex.: enquanto a modal de dica está aberta).
 */

type Props = {
  questionId: string;
  seconds?: number;
  paused?: boolean;
  onExpire: () => void;
};

export function QuestionTimer({
  questionId,
  seconds = MAX_QUESTION_SECONDS,
  paused = false,
  onExpire,
}: Props) {
  const [left, setLeft] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setLeft(seconds);
  }, [questionId, seconds]);

  useEffect(() => {
    if (paused) return;
    if (left <= 0) {
      onExpireRef.current();
      return;
    }
    const id = setInterval(() => {
      setLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [paused, left]);

  const pct = Math.max(0, Math.min(1, left / seconds));
  const color = left <= 5 ? '#F87171' : left <= 10 ? '#FBBF24' : HomeTheme.link;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.text, { color }]}>{left}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 999 },
  text: { fontWeight: '900', fontSize: 14, width: 36, textAlign: 'right' },
});
