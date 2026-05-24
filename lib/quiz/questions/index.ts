import type { QuizLevel, QuizThemeId } from '@/lib/quiz/themes';
import type { QuizQuestion } from '@/lib/quiz/questions/types';

import { AI_QUESTIONS } from './ai';
import { AUTH_TOKENS_QUESTIONS } from './auth-tokens';
import { DATA_STRUCTURES_QUESTIONS } from './data-structures';
import { DATABASES_QUESTIONS } from './databases';
import { LANGUAGES_QUESTIONS } from './languages';
import { LOGIC_QUESTIONS } from './logic';
import { NETWORKS_QUESTIONS } from './networks';

/**
 * Banco completo de questões (C-02, C-03, G-04).
 *
 * Cobertura por tema (`G-04` - 30 totais = 3 níveis × 10):
 * - languages, logic, data-structures, networks, databases, auth-tokens, ai
 */
export const QUESTION_BANK: readonly QuizQuestion[] = [
  ...LANGUAGES_QUESTIONS,
  ...LOGIC_QUESTIONS,
  ...DATA_STRUCTURES_QUESTIONS,
  ...NETWORKS_QUESTIONS,
  ...DATABASES_QUESTIONS,
  ...AUTH_TOKENS_QUESTIONS,
  ...AI_QUESTIONS,
];

/** Embaralhamento determinístico ou aleatório (mantém pureza em testes futuros). */
function shuffleArray<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * Padrão fixo de dificuldade para uma tentativa de 10 questões (G-02 + G-04).
 *
 * Sequência: 2 fáceis → 2 médias → 2 difíceis → 2 fáceis → 2 médias.
 * Resultado: 4 fáceis + 4 médias + 2 difíceis, sempre nessa ordem.
 *
 * Mantemos este padrão como **fonte da verdade do cliente** mesmo quando o
 * backend (`quiz-api.ts`) fornecer as questões — ele deve devolvê-las já nesta
 * ordem. Em modo offline, `pickMixedQuestions` segue exatamente este padrão.
 */
export const QUIZ_LEVEL_PATTERN: readonly QuizLevel[] = [
  'easy',
  'easy',
  'medium',
  'medium',
  'hard',
  'hard',
  'easy',
  'easy',
  'medium',
  'medium',
] as const;

/**
 * Devolve até `count` questões aleatórias do `themeId` e `level` informados.
 *
 * Utilitário interno: a UX principal usa `pickMixedQuestions`. Mantido para
 * cenários como testes ou banco isolado.
 */
export function pickQuestions(
  themeId: QuizThemeId,
  level: QuizLevel,
  count = 10
): QuizQuestion[] {
  const pool = QUESTION_BANK.filter((q) => q.themeId === themeId && q.level === level);
  return shuffleArray(pool).slice(0, count);
}

/**
 * Monta uma tentativa misturando dificuldades segundo `QUIZ_LEVEL_PATTERN`
 * (4 fáceis + 4 médias + 2 difíceis, intercaladas).
 *
 * - Pega `pattern.length` questões do banco, respeitando o nível de cada slot.
 * - Embaralha o pool de cada nível antes de selecionar, garantindo variação.
 * - Se algum nível tiver menos questões que o necessário, repete questões já
 *   sorteadas para preservar a contagem (acontece apenas se o banco encolher).
 */
export function pickMixedQuestions(
  themeId: QuizThemeId,
  pattern: readonly QuizLevel[] = QUIZ_LEVEL_PATTERN
): QuizQuestion[] {
  const pools: Record<QuizLevel, QuizQuestion[]> = {
    easy: shuffleArray(QUESTION_BANK.filter((q) => q.themeId === themeId && q.level === 'easy')),
    medium: shuffleArray(QUESTION_BANK.filter((q) => q.themeId === themeId && q.level === 'medium')),
    hard: shuffleArray(QUESTION_BANK.filter((q) => q.themeId === themeId && q.level === 'hard')),
  };

  const cursor: Record<QuizLevel, number> = { easy: 0, medium: 0, hard: 0 };
  const out: QuizQuestion[] = [];

  for (const level of pattern) {
    const pool = pools[level];
    if (pool.length === 0) continue;
    const idx = cursor[level] % pool.length;
    cursor[level] += 1;
    out.push(pool[idx]!);
  }
  return out;
}

/** Total de questões disponíveis por (tema, nível). Útil para validação. */
export function countQuestions(themeId: QuizThemeId, level: QuizLevel): number {
  return QUESTION_BANK.filter((q) => q.themeId === themeId && q.level === level).length;
}

export type { QuizQuestion };
