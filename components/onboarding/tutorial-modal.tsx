import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { HomeTheme } from '@/constants/home-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Tutorial guiado (O-02):
 * passos cobrindo auth (identificação), quiz, LLM e ranking.
 *
 * Aceita `onFinish` (gravar flag, fechar) e `onSkip` (mesma ação, mas
 * tipicamente sem celebrar) — também grava a flag para não reaparecer.
 */

const STEPS: { emoji: string; title: string; body: string }[] = [
  {
    emoji: '👋',
    title: 'Bem-vindo ao Quizify!',
    body: 'Vamos te guiar em menos de 1 minuto pelo essencial do jogo.',
  },
  {
    emoji: '🧑‍💻',
    title: '1. Identifique-se',
    body: 'Você joga com um nome único. Ele aparece no ranking e no seu perfil.',
  },
  {
    emoji: '🎯',
    title: '2. Toque em Jogar',
    body: 'Você recebe 10 perguntas de tecnologia. O assunto aparece no texto de cada questão.',
  },
  {
    emoji: '❓',
    title: '3. Responda as 10 questões',
    body: 'Mix de dificuldades (4 fáceis, 4 médias, 2 difíceis). Cada questão tem 25s — seja rápido!',
  },
  {
    emoji: '💡',
    title: '4. Uma dica por tentativa',
    body: 'Em qualquer questão você pode pedir uma dica para a IA — mas só uma vez por tentativa.',
  },
  {
    emoji: '🏆',
    title: '5. Suba no ranking',
    body: 'Top 10 global, com base na sua melhor pontuação. Você tem 3 tentativas por dia.',
  },
];

type Props = {
  visible: boolean;
  onFinish: () => void;
  onSkip: () => void;
};

export function TutorialModal({ visible, onFinish, onSkip }: Props) {
  const { scaleFont, horizontalPadding } = useResponsive();
  const [step, setStep] = useState(0);
  const isLast = step >= STEPS.length - 1;
  const current = STEPS[step]!;

  const handleNext = () => {
    if (isLast) {
      setStep(0);
      onFinish();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    setStep(0);
    onSkip();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleSkip}>
      <View style={[styles.backdrop, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.card}>
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step && styles.dotActive,
                  i < step && styles.dotDone,
                ]}
              />
            ))}
          </View>

          <Text style={[styles.emoji, { fontSize: scaleFont(56) }]}>{current.emoji}</Text>
          <Text style={[styles.title, { fontSize: scaleFont(22) }]}>{current.title}</Text>
          <Text style={[styles.body, { fontSize: scaleFont(15), lineHeight: scaleFont(22) }]}>
            {current.body}
          </Text>

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1 }]}>
            <Text style={styles.ctaText}>{isLast ? 'Começar a jogar' : 'Próximo'}</Text>
          </Pressable>

          {!isLast ? (
            <Pressable onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Pular tutorial</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
    alignItems: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH.modal,
  },
  dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 18 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dotActive: { backgroundColor: HomeTheme.yellow, width: 18 },
  dotDone: { backgroundColor: HomeTheme.link },
  emoji: { marginBottom: 12 },
  title: { color: HomeTheme.text, fontWeight: '900', textAlign: 'center' },
  body: {
    color: HomeTheme.textMuted,
    textAlign: 'center',
    marginTop: 10,
  },
  cta: {
    marginTop: 22,
    backgroundColor: HomeTheme.yellow,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    minWidth: 200,
    alignItems: 'center',
  },
  ctaText: { color: '#0f172a', fontSize: 16, fontWeight: '900' },
  skipBtn: { marginTop: 14, padding: 8 },
  skipText: { color: HomeTheme.textMuted, fontSize: 13, fontWeight: '700' },
});
