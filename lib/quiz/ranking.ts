import { secureGetItem, secureSetItem } from '@/lib/secure-storage';
import type { AttemptLevel } from '@/lib/quiz/attempts';
import type { QuizThemeId } from '@/lib/quiz/themes';

/**
 * Ranking (R-01 .. R-03).
 *
 * Decisões de produto:
 * - **R-01**: Top 10 global, ordenado por melhor pontuação em **uma única tentativa**.
 *   Critério de desempate: menor `durationMs` (mais rápido vence). Janela: histórico geral.
 * - **R-02**: A tela `(tabs)/rank.tsx` consome `getTopRanking` e destaca a linha do usuário.
 * - **R-03**: `submitToRanking` é chamada após `recordAttempt` em `result.tsx`, garantindo
 *   atualização imediata após cada tentativa válida.
 *
 * Persistência local: sem backend, mantemos o ranking em SecureStore.
 */

const KEY = 'quizify_ranking_v1';
export const RANKING_LIMIT = 10;

export type RankEntry = {
  /** Id da tentativa que gerou esta entrada (referência). */
  attemptId: string;
  userId: string;
  userName: string;
  themeId: QuizThemeId;
  /** Sempre `'mixed'` em tentativas novas; `QuizLevel` preservado p/ dados antigos. */
  level: AttemptLevel;
  score: number;
  durationMs: number;
  finishedAt: string;
};

type Store = RankEntry[];

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

async function writeStore(s: Store): Promise<void> {
  await secureSetItem(KEY, JSON.stringify(s));
}

function compareEntries(a: RankEntry, b: RankEntry): number {
  if (b.score !== a.score) return b.score - a.score;
  if (a.durationMs !== b.durationMs) return a.durationMs - b.durationMs;
  return +new Date(a.finishedAt) - +new Date(b.finishedAt);
}

/**
 * Insere uma entrada no ranking se for melhor que a anterior do mesmo usuário,
 * mantendo apenas a *melhor* tentativa por usuário. Retorna a posição (1-based)
 * dentro do top global, ou `null` se não entrou no top `RANKING_LIMIT`.
 */
export async function submitToRanking(entry: RankEntry): Promise<{
  rank: number | null;
  totalAfter: number;
}> {
  const store = await readStore();
  const existingIndex = store.findIndex((e) => e.userId === entry.userId);

  if (existingIndex >= 0) {
    const existing = store[existingIndex]!;
    if (compareEntries(existing, entry) <= 0) {
      // já era igual ou melhor que a nova → não substitui
      store.sort(compareEntries);
      const idx = store.findIndex((e) => e.attemptId === existing.attemptId);
      await writeStore(store);
      return {
        rank: idx >= 0 && idx < RANKING_LIMIT ? idx + 1 : null,
        totalAfter: store.length,
      };
    }
    store.splice(existingIndex, 1);
  }

  store.push(entry);
  store.sort(compareEntries);
  await writeStore(store);

  const idx = store.findIndex((e) => e.attemptId === entry.attemptId);
  return {
    rank: idx >= 0 && idx < RANKING_LIMIT ? idx + 1 : null,
    totalAfter: store.length,
  };
}

/** Top do ranking (default: top `RANKING_LIMIT`). */
export async function getTopRanking(limit: number = RANKING_LIMIT): Promise<RankEntry[]> {
  const store = await readStore();
  store.sort(compareEntries);
  return store.slice(0, limit);
}

/** Encontra a posição (1-based) do usuário no ranking global ordenado. */
export async function getUserRankPosition(userId: string): Promise<{
  rank: number | null;
  entry: RankEntry | null;
  total: number;
}> {
  const store = await readStore();
  store.sort(compareEntries);
  const idx = store.findIndex((e) => e.userId === userId);
  return {
    rank: idx >= 0 ? idx + 1 : null,
    entry: idx >= 0 ? store[idx]! : null,
    total: store.length,
  };
}
