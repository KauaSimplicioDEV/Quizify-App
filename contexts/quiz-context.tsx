import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { QuizQuestion } from '@/lib/quiz/questions';
import { scoreForQuestion } from '@/lib/quiz/scoring';
import type { QuizThemeId } from '@/lib/quiz/themes';

/**
 * Estado em memória de uma tentativa em andamento.
 *
 * - **G-02**: 10 questões por tentativa.
 * - **G-04**: tentativa mista (4 fáceis + 4 médias + 2 difíceis intercaladas);
 *   o nível fica em cada `QuizQuestion`, não na tentativa.
 * - **G-05**: feedback é dado por questão (`submitAnswer` retorna se acertou)
 *   e também consolidado em `result.tsx` ao final.
 * - **L-02**: `llmUsed` garante exatamente um uso de LLM por tentativa.
 */

export type AnswerLog = {
  questionId: string;
  selectedIndex: number | null;
  correct: boolean;
  scoreEarned: number;
  secondsTaken: number;
};

export type QuizAttemptState = {
  themeId: QuizThemeId;
  /** Identificador opcional vindo do backend (`POST /quiz/start`). */
  remoteAttemptId?: string;
  questions: QuizQuestion[];
  index: number;
  answers: AnswerLog[];
  score: number;
  startedAt: number;
  questionStartedAt: number;
  llmUsed: boolean;
  finished: boolean;
};

type StartArgs = {
  themeId: QuizThemeId;
  questions: QuizQuestion[];
  remoteAttemptId?: string;
};

type SubmitResult = {
  correct: boolean;
  scoreEarned: number;
  isLast: boolean;
  totalScore: number;
};

type QuizContextValue = {
  attempt: QuizAttemptState | null;
  start: (args: StartArgs) => QuizAttemptState;
  submitAnswer: (selectedIndex: number | null, secondsTaken: number) => SubmitResult;
  advance: () => boolean;
  reset: () => void;
  markLlmUsed: () => void;
  /** Total de questões respondidas, acertos e tempo total. */
  totals: () => { questions: number; correct: number; durationMs: number };
};

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [attempt, setAttempt] = useState<QuizAttemptState | null>(null);
  const attemptRef = useRef<QuizAttemptState | null>(null);
  attemptRef.current = attempt;

  const start = useCallback(({ themeId, questions, remoteAttemptId }: StartArgs): QuizAttemptState => {
    const now = Date.now();
    const next: QuizAttemptState = {
      themeId,
      remoteAttemptId,
      questions,
      index: 0,
      answers: [],
      score: 0,
      startedAt: now,
      questionStartedAt: now,
      llmUsed: false,
      finished: false,
    };
    setAttempt(next);
    attemptRef.current = next;
    return next;
  }, []);

  const submitAnswer = useCallback(
    (selectedIndex: number | null, secondsTaken: number): SubmitResult => {
      const current = attemptRef.current;
      if (!current) {
        throw new Error('submitAnswer chamado sem tentativa ativa.');
      }
      const question = current.questions[current.index];
      if (!question) {
        throw new Error('Questão atual não encontrada.');
      }

      const correct = selectedIndex !== null && selectedIndex === question.correctIndex;
      // G-06: a pontuação respeita o nível **da questão** (mista por tentativa).
      const scoreEarned = scoreForQuestion({
        correct,
        level: question.level,
        secondsTaken,
      });

      const log: AnswerLog = {
        questionId: question.id,
        selectedIndex,
        correct,
        scoreEarned,
        secondsTaken,
      };

      const nextScore = current.score + scoreEarned;
      const isLast = current.index >= current.questions.length - 1;
      const updated: QuizAttemptState = {
        ...current,
        answers: [...current.answers, log],
        score: nextScore,
        finished: isLast,
      };

      attemptRef.current = updated;
      setAttempt(updated);
      return { correct, scoreEarned, isLast, totalScore: nextScore };
    },
    []
  );

  const advance = useCallback((): boolean => {
    const current = attemptRef.current;
    if (!current || current.finished) return false;
    const nextIndex = current.index + 1;
    if (nextIndex >= current.questions.length) {
      const updated = { ...current, finished: true };
      attemptRef.current = updated;
      setAttempt(updated);
      return false;
    }
    const updated: QuizAttemptState = {
      ...current,
      index: nextIndex,
      questionStartedAt: Date.now(),
    };
    attemptRef.current = updated;
    setAttempt(updated);
    return true;
  }, []);

  const reset = useCallback(() => {
    attemptRef.current = null;
    setAttempt(null);
  }, []);

  const markLlmUsed = useCallback(() => {
    const current = attemptRef.current;
    if (!current || current.llmUsed) return;
    const updated = { ...current, llmUsed: true };
    attemptRef.current = updated;
    setAttempt(updated);
  }, []);

  const totals = useCallback(() => {
    const current = attemptRef.current;
    if (!current) return { questions: 0, correct: 0, durationMs: 0 };
    return {
      questions: current.answers.length,
      correct: current.answers.filter((a) => a.correct).length,
      durationMs: Date.now() - current.startedAt,
    };
  }, []);

  const value = useMemo<QuizContextValue>(
    () => ({ attempt, start, submitAnswer, advance, reset, markLlmUsed, totals }),
    [attempt, start, submitAnswer, advance, reset, markLlmUsed, totals]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz deve ser usado dentro de QuizProvider');
  return ctx;
}
