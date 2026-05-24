import { secureGetItem, secureSetItem } from '@/lib/secure-storage';
import type { QuizLevel, QuizThemeId } from '@/lib/quiz/themes';

/**
 * Gestão de tentativas (G-03).
 *
 * Decisão de produto: **3 tentativas por dia, por usuário** (reset à meia-noite local).
 * O limite é compartilhado entre todos os temas/níveis e cobre tanto tentativas
 * concluídas quanto abandonadas.
 *
 * Cada tentativa é "mista": as 10 questões variam em dificuldade conforme o
 * padrão `QUIZ_LEVEL_PATTERN`. Por isso `level` é sempre `'mixed'` em tentativas
 * novas; o valor por questão fica em `QuizQuestion.level`.
 */
export const ATTEMPTS_PER_DAY = 3;

const KEY = 'quizify_attempts_v1';

/** Marca uma tentativa que mistura dificuldades. */
export type AttemptLevel = QuizLevel | 'mixed';

export type StoredAttempt = {
  id: string;
  userId: string;
  themeId: QuizThemeId;
  /** Em tentativas novas é sempre `'mixed'`; preserva `QuizLevel` para dados antigos. */
  level: AttemptLevel;
  /** Pontuação total da tentativa. */
  score: number;
  /** Número de acertos (0..10). */
  correctCount: number;
  /** Total de questões respondidas (idealmente 10). */
  totalQuestions: number;
  /** Tempo total em ms desde o início até concluir. */
  durationMs: number;
  /** ISO date timestamp (`new Date().toISOString()`). */
  finishedAt: string;
  /** Marca se o usuário usou o "uso de LLM" desta tentativa (L-02). */
  llmUsed: boolean;
};

type Store = StoredAttempt[];

async function readStore(): Promise<Store> {
  try {
    const raw = await secureGetItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Store) : [];
  } catch {
    return [];
  }
}

async function writeStore(store: Store): Promise<void> {
  await secureSetItem(KEY, JSON.stringify(store));
}

function sameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Tentativas do usuário no dia local atual. */
export async function getTodayAttempts(userId: string): Promise<StoredAttempt[]> {
  const store = await readStore();
  const today = new Date();
  return store.filter((a) => {
    if (a.userId !== userId) return false;
    const finished = new Date(a.finishedAt);
    return sameLocalDate(finished, today);
  });
}

export type AttemptsStatus = {
  used: number;
  remaining: number;
  limit: number;
  canPlay: boolean;
  resetsAtMs: number;
};

/** Estado de tentativas do usuário hoje. */
export async function getAttemptsStatus(userId: string): Promise<AttemptsStatus> {
  const todays = await getTodayAttempts(userId);
  const used = todays.length;
  const remaining = Math.max(0, ATTEMPTS_PER_DAY - used);
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  return {
    used,
    remaining,
    limit: ATTEMPTS_PER_DAY,
    canPlay: remaining > 0,
    resetsAtMs: tomorrow.getTime(),
  };
}

export type RecordAttemptInput = Omit<StoredAttempt, 'id' | 'finishedAt'> & {
  finishedAt?: string;
};

/** Grava uma tentativa concluída (G-07 — persistência local). */
export async function recordAttempt(input: RecordAttemptInput): Promise<StoredAttempt> {
  const attempt: StoredAttempt = {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    finishedAt: input.finishedAt ?? new Date().toISOString(),
    ...input,
  };

  const store = await readStore();
  store.push(attempt);
  await writeStore(store);
  return attempt;
}

/** Histórico completo do usuário (ordenado do mais recente para o mais antigo). */
export async function getUserAttempts(userId: string): Promise<StoredAttempt[]> {
  const store = await readStore();
  return store
    .filter((a) => a.userId === userId)
    .sort((a, b) => +new Date(b.finishedAt) - +new Date(a.finishedAt));
}

/** Estatísticas resumidas usadas em Perfil/Troféus. */
export async function getUserStats(userId: string): Promise<{
  attempts: number;
  bestScore: number;
  totalScore: number;
  averageScore: number;
  correctRate: number;
}> {
  const attempts = await getUserAttempts(userId);
  if (attempts.length === 0) {
    return { attempts: 0, bestScore: 0, totalScore: 0, averageScore: 0, correctRate: 0 };
  }
  const totalScore = attempts.reduce((acc, a) => acc + a.score, 0);
  const bestScore = attempts.reduce((acc, a) => Math.max(acc, a.score), 0);
  const totalCorrect = attempts.reduce((acc, a) => acc + a.correctCount, 0);
  const totalAnswers = attempts.reduce((acc, a) => acc + a.totalQuestions, 0);
  return {
    attempts: attempts.length,
    bestScore,
    totalScore,
    averageScore: Math.round(totalScore / attempts.length),
    correctRate: totalAnswers === 0 ? 0 : Math.round((totalCorrect / totalAnswers) * 100),
  };
}
