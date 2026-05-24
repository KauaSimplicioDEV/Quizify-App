import { AnswerOption } from '@/components/quiz/answer-option';
import { FeedbackBanner } from '@/components/quiz/feedback-banner';
import { HintModal } from '@/components/quiz/hint-modal';
import { QuestionTimer } from '@/components/quiz/question-timer';
import { QuizHeader } from '@/components/quiz/quiz-header';
import { ScreenScroll } from '@/components/ui/screen-scroll';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { HomeTheme } from '@/constants/home-theme';
import { useQuiz } from '@/contexts/quiz-context';
import { useResponsive } from '@/hooks/use-responsive';
import { requestHint, type HintResult } from '@/lib/quiz/llm';
import { requestRemoteHint } from '@/lib/quiz/quiz-api';
import { getThemeById } from '@/lib/quiz/themes';
import { TABS_ROOT } from '@/lib/routes';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Tela de jogo (G-02, G-05).
 *
 * - 10 questões em sequência.
 * - Feedback é exibido **por questão** (decisão de produto para G-05), com
 *   explicação curta e botão "Próxima". O resultado consolidado fica em result.tsx.
 * - Permite 1 dica por tentativa (L-02 / L-03).
 * - Timer de 25s; resposta nula em tempo esgotado vale 0 pts.
 */
export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const { isTablet, scaleFont } = useResponsive();
  const { attempt, submitAnswer, advance, markLlmUsed } = useQuiz();

  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<'answering' | 'feedback'>('answering');
  const [hintVisible, setHintVisible] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hint, setHint] = useState<HintResult | null>(null);

  const questionStartRef = useRef<number>(Date.now());
  if (attempt && phase === 'answering' && !questionStartRef.current) {
    questionStartRef.current = Date.now();
  }

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        Alert.alert(
          'Sair da tentativa?',
          'Você perderá o progresso desta tentativa.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sair',
              style: 'destructive',
              onPress: () => router.replace(TABS_ROOT),
            },
          ]
        );
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [])
  );

  const currentQuestion = useMemo(() => {
    if (!attempt) return null;
    return attempt.questions[attempt.index] ?? null;
  }, [attempt]);

  const theme = useMemo(() => {
    if (!attempt) return null;
    return getThemeById(attempt.themeId) ?? null;
  }, [attempt]);

  if (!attempt || !currentQuestion || !theme) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />
        <View style={[styles.center, { paddingTop: insets.top + 60 }]}>
          <Text style={styles.errorText}>Tentativa não encontrada.</Text>
          <Pressable onPress={() => router.replace(TABS_ROOT)} style={styles.errorBtn}>
            <Text style={styles.errorBtnText}>Voltar ao início</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const lastAnswer = attempt.answers[attempt.answers.length - 1] ?? null;

  const handleSelect = (idx: number) => {
    if (phase === 'feedback') return;
    setSelected(idx);
  };

  const handleConfirm = () => {
    if (phase === 'feedback') return;
    const seconds = Math.max(0, (Date.now() - questionStartRef.current) / 1000);
    submitAnswer(selected, seconds);
    setPhase('feedback');
  };

  const handleTimeUp = () => {
    if (phase === 'feedback') return;
    const seconds = Math.max(0, (Date.now() - questionStartRef.current) / 1000);
    submitAnswer(null, seconds);
    setPhase('feedback');
  };

  const handleNext = () => {
    const isLast = attempt.index >= attempt.questions.length - 1;
    if (isLast) {
      router.replace('/quiz/result');
      return;
    }
    advance();
    setSelected(null);
    setHint(null);
    setPhase('answering');
    questionStartRef.current = Date.now();
  };

  const handleHint = async () => {
    if (attempt.llmUsed) return;
    markLlmUsed();
    setHintVisible(true);
    setHintLoading(true);
    try {
      // Quando há backend, preferimos o proxy server-side (L-01). Caso não exista
      // (resposta null) ou a chamada falhe, caímos no helper local que tenta
      // Gemini ou usa o hint pré-curado da questão.
      const remote = await requestRemoteHint(currentQuestion.id);
      if (remote) {
        setHint(remote);
        return;
      }
      const result = await requestHint(currentQuestion);
      setHint(result);
    } finally {
      setHintLoading(false);
    }
  };

  const optionState = (idx: number): 'idle' | 'correct' | 'wrong' => {
    if (phase !== 'feedback') return 'idle';
    if (idx === currentQuestion.correctIndex) return 'correct';
    if (lastAnswer && lastAnswer.selectedIndex === idx) return 'wrong';
    return 'idle';
  };

  const isSelected = (idx: number): boolean =>
    phase === 'answering' ? selected === idx : false;

  const isLast = attempt.index >= attempt.questions.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />

      <ScreenScroll withTabBar={false} topExtra={12}>
        <QuizHeader
          theme={theme}
          currentLevel={currentQuestion.level}
          questionIndex={attempt.index}
          totalQuestions={attempt.questions.length}
          score={attempt.score}
        />

        <View style={styles.timerWrap}>
          <QuestionTimer
            questionId={currentQuestion.id}
            paused={phase === 'feedback' || hintVisible}
            onExpire={handleTimeUp}
          />
        </View>

        <View style={styles.promptCard}>
          <Text style={[styles.promptText, { fontSize: scaleFont(17), lineHeight: scaleFont(24) }]}>
            {currentQuestion.prompt}
          </Text>

          {!attempt.llmUsed && phase === 'answering' ? (
            <Pressable
              onPress={() => void handleHint()}
              style={({ pressed }) => [styles.hintBtn, { opacity: pressed ? 0.85 : 1 }]}>
              <Text style={styles.hintBtnText}>💡 Pedir dica</Text>
            </Pressable>
          ) : (
            <View style={styles.hintUsedTag}>
              <Text style={styles.hintUsedText}>
                {attempt.llmUsed ? 'Dica usada nesta tentativa' : ''}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.optionsList, isTablet && styles.optionsListWide]}>
          {currentQuestion.options.map((opt, idx) => (
            <AnswerOption
              key={`${currentQuestion.id}-${idx}`}
              letter={String.fromCharCode(65 + idx)}
              text={opt}
              selected={isSelected(idx)}
              state={optionState(idx)}
              disabled={phase === 'feedback'}
              onPress={() => handleSelect(idx)}
            />
          ))}
        </View>

        {phase === 'answering' ? (
          <Pressable
            onPress={handleConfirm}
            disabled={selected === null}
            style={({ pressed }) => [
              styles.confirmBtn,
              selected === null && styles.confirmBtnDisabled,
              { opacity: pressed && selected !== null ? 0.9 : 1 },
            ]}>
            <Text
              style={[
                styles.confirmText,
                selected === null && styles.confirmTextDisabled,
              ]}>
              Confirmar resposta
            </Text>
          </Pressable>
        ) : lastAnswer ? (
          <FeedbackBanner
            correct={lastAnswer.correct}
            pointsEarned={lastAnswer.scoreEarned}
            explanation={currentQuestion.explanation}
            isLast={isLast}
            onNext={handleNext}
          />
        ) : null}
      </ScreenScroll>

      <HintModal
        visible={hintVisible}
        loading={hintLoading}
        hint={hint?.hint}
        source={hint?.source}
        onClose={() => setHintVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  errorText: { color: HomeTheme.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  errorBtn: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: HomeTheme.yellow,
    borderRadius: 12,
  },
  errorBtnText: { color: '#0f172a', fontWeight: '900' },
  timerWrap: { marginTop: 16, marginBottom: 12 },
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
    padding: 18,
    marginBottom: 16,
  },
  promptText: { color: HomeTheme.text, fontWeight: '700' },
  hintBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,225,53,0.18)',
    borderColor: HomeTheme.yellow,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  hintBtnText: { color: HomeTheme.yellow, fontWeight: '900', fontSize: 13 },
  hintUsedTag: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hintUsedText: { color: HomeTheme.textMuted, fontSize: 12, fontStyle: 'italic' },
  optionsList: { marginBottom: 12 },
  optionsListWide: {
    maxWidth: CONTENT_MAX_WIDTH.quizOptions,
    alignSelf: 'center',
    width: '100%',
  },
  confirmBtn: {
    marginTop: 8,
    backgroundColor: HomeTheme.yellow,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.08)' },
  confirmText: { color: '#0f172a', fontWeight: '900', fontSize: 16 },
  confirmTextDisabled: { color: HomeTheme.textMuted },
});
