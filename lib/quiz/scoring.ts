import { QUIZ_LEVEL_META, type QuizLevel } from '@/lib/quiz/themes';

/**
 * Sistema de pontuação (G-06).
 *
 * Pontos por questão = `BASE_PER_QUESTION` × multiplicador do nível × bônus de tempo.
 * - Base por acerto: 100 pts.
 * - Multiplicador: Fácil 1.0 / Médio 1.5 / Difícil 2.0.
 * - Bônus de tempo: linear entre 1.0 (0s) e 0.5 (≥ `MAX_QUESTION_SECONDS`).
 *   Resposta errada ou expirada: 0 pts.
 */

export const BASE_PER_QUESTION = 100;
export const MAX_QUESTION_SECONDS = 25;
export const MIN_TIME_FACTOR = 0.5;

/** Devolve fator de tempo entre 0.5 e 1.0. */
export function timeBonusFactor(secondsTaken: number): number {
  if (!Number.isFinite(secondsTaken) || secondsTaken <= 0) return 1;
  const clamped = Math.min(Math.max(secondsTaken, 0), MAX_QUESTION_SECONDS);
  const decay = (1 - MIN_TIME_FACTOR) * (clamped / MAX_QUESTION_SECONDS);
  return Number((1 - decay).toFixed(4));
}

export type QuestionScoreInput = {
  correct: boolean;
  level: QuizLevel;
  secondsTaken: number;
};

export function scoreForQuestion({ correct, level, secondsTaken }: QuestionScoreInput): number {
  if (!correct) return 0;
  const meta = QUIZ_LEVEL_META[level];
  const points = BASE_PER_QUESTION * meta.multiplier * timeBonusFactor(secondsTaken);
  return Math.round(points);
}

/** Pontuação máxima teórica de uma tentativa (10 questões) no nível dado. */
export function maxScoreForLevel(level: QuizLevel, questions = 10): number {
  return Math.round(BASE_PER_QUESTION * QUIZ_LEVEL_META[level].multiplier * questions);
}
