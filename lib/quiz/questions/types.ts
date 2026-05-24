import type { QuizLevel, QuizThemeId } from '@/lib/quiz/themes';

export type QuizQuestion = {
  id: string;
  themeId: QuizThemeId;
  level: QuizLevel;
  prompt: string;
  /** 4 alternativas (A, B, C, D). */
  options: readonly [string, string, string, string];
  /** Índice (0..3) da alternativa correta. */
  correctIndex: 0 | 1 | 2 | 3;
  /** Pequena explicação exibida no resultado/feedback. */
  explanation: string;
  /** Dica curta para o recurso de LLM/ajuda. NÃO deve revelar a resposta. */
  hint: string;
};
