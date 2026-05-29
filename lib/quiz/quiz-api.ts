/**
 * Camada de integração com o backend do quiz.
 *
 * Quando `EXPO_PUBLIC_API_URL` está definida, todas as operações vão para a API
 * REST. Caso contrário, caímos no fallback local (banco em `lib/quiz/questions/*`,
 * tentativas/ranking em SecureStore via `lib/quiz/attempts.ts` e `lib/quiz/ranking.ts`).
 *
 * O contrato detalhado dos endpoints está em `docs/BACKEND-INTEGRATION.md`.
 *
 * Cabeçalhos: todas as chamadas autenticadas usam `authorizedFetch` (`Authorization: Bearer <jwt>`).
 */

import { authorizedFetch, ApiClientError } from '@/lib/api-client';
import { getApiBase } from '@/lib/api-config';
import { QUIZ_LEVEL_PATTERN, pickMixedQuestionsFromBank } from '@/lib/quiz/questions';
import type { QuizQuestion } from '@/lib/quiz/questions/types';
import {
  type StoredAttempt,
  recordAttempt as recordAttemptLocal,
  getUserAttempts as getUserAttemptsLocal,
  getUserStats as getUserStatsLocal,
  getAttemptsStatus as getAttemptsStatusLocal,
  type AttemptsStatus,
  type RecordAttemptInput,
} from '@/lib/quiz/attempts';

export type { AttemptsStatus } from '@/lib/quiz/attempts';
export type { RankEntry } from '@/lib/quiz/ranking';
import {
  type RankEntry,
  submitToRanking as submitToRankingLocal,
  getTopRanking as getTopRankingLocal,
  getUserRankPosition as getUserRankPositionLocal,
  RANKING_LIMIT,
} from '@/lib/quiz/ranking';
import type { QuizLevel, QuizThemeId } from '@/lib/quiz/themes';

const REQUEST_TIMEOUT_MS = 12_000;

export class QuizApiError extends Error {
  constructor(
    message: string,
    public code:
      | 'config'
      | 'network'
      | 'timeout'
      | 'unauthorized'
      | 'forbidden'
      | 'limit_reached'
      | 'invalid_response'
      | 'unknown',
    public status?: number
  ) {
    super(message);
    this.name = 'QuizApiError';
  }
}

/** `true` quando o app deve operar via backend; `false` ⇒ fallback local. */
export function isApiEnabled(): boolean {
  return !!getApiBase();
}

// --------------------------------------------------------------------------
// Helpers internos
// --------------------------------------------------------------------------

async function fetchWithTimeout(
  doFetch: () => Promise<Response>,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await doFetch();
  } finally {
    clearTimeout(timer);
  }
}

function isQuizLevel(v: unknown): v is QuizLevel {
  return v === 'easy' || v === 'medium' || v === 'hard';
}

function parseQuizQuestion(raw: unknown, fallbackThemeId: QuizThemeId, expectedLevel: QuizLevel): QuizQuestion | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const id = typeof o.id === 'string' ? o.id : null;
  const prompt = typeof o.prompt === 'string' ? o.prompt : null;
  const explanation = typeof o.explanation === 'string' ? o.explanation : '';
  const hint = typeof o.hint === 'string' ? o.hint : 'Pense com calma e elimine opções claramente erradas.';
  const themeId = typeof o.themeId === 'string' ? (o.themeId as QuizThemeId) : fallbackThemeId;
  const level = isQuizLevel(o.level) ? o.level : expectedLevel;
  const correctIndex = typeof o.correctIndex === 'number' ? o.correctIndex : -1;
  const optionsRaw = Array.isArray(o.options) ? o.options : null;

  if (!id || !prompt || !optionsRaw || optionsRaw.length !== 4) return null;
  if (correctIndex < 0 || correctIndex > 3) return null;

  const options = optionsRaw.map((v) => String(v ?? '')) as [string, string, string, string];
  return {
    id,
    themeId,
    level,
    prompt,
    options,
    correctIndex: correctIndex as 0 | 1 | 2 | 3,
    explanation,
    hint,
  };
}

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  try {
    const json = await res.json();
    return json && typeof json === 'object' ? (json as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function mapHttpError(status: number, fallbackMessage = 'Falha de comunicação.'): QuizApiError {
  if (status === 401) return new QuizApiError('Sessão inválida. Faça login novamente.', 'unauthorized', 401);
  if (status === 403) return new QuizApiError('Acesso negado.', 'forbidden', 403);
  if (status === 429) return new QuizApiError('Limite de tentativas atingido.', 'limit_reached', 429);
  return new QuizApiError(fallbackMessage, 'network', status);
}

// --------------------------------------------------------------------------
// API pública (consumida pelas telas)
// --------------------------------------------------------------------------

export type StartQuizRequest = {
  /** Pattern enviado ao backend para auditoria/coerência. */
  pattern?: readonly QuizLevel[];
};

export type StartQuizResponse = {
  /** Identificador opcional da tentativa criada pelo backend (lockable). */
  attemptId?: string;
  questions: QuizQuestion[];
};

/**
 * Solicita as 10 questões da tentativa.
 *
 * Backend (quando configurado): `POST /quiz/start` (ver `BACKEND-INTEGRATION.md`).
 * Modo offline: usa `pickMixedQuestionsFromBank` localmente.
 */
export async function startQuiz(req: StartQuizRequest = {}): Promise<StartQuizResponse> {
  const pattern = req.pattern ?? QUIZ_LEVEL_PATTERN;
  const base = getApiBase();
  if (!base) {
    return {
      questions: pickMixedQuestionsFromBank(pattern),
    };
  }

  try {
    const res = await fetchWithTimeout(() =>
      authorizedFetch('/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern,
          count: pattern.length,
        }),
      })
    );

    if (!res.ok) throw mapHttpError(res.status, 'Não foi possível iniciar o quiz.');

    const data = await safeJson(res);
    const rawList = Array.isArray(data.questions) ? data.questions : null;
    if (!rawList || rawList.length === 0) {
      throw new QuizApiError('Resposta inválida do servidor (questions vazias).', 'invalid_response');
    }

    const parsed: QuizQuestion[] = [];
    rawList.forEach((raw, i) => {
      const q = parseQuizQuestion(raw, 'languages', pattern[i] ?? 'easy');
      if (q) parsed.push(q);
    });
    if (parsed.length === 0) {
      throw new QuizApiError('Nenhuma questão pôde ser interpretada.', 'invalid_response');
    }

    return {
      attemptId: typeof data.attemptId === 'string' ? data.attemptId : undefined,
      questions: parsed,
    };
  } catch (e) {
    if (e instanceof QuizApiError) throw e;
    if (e instanceof ApiClientError) throw new QuizApiError(e.message, 'unauthorized', e.status);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new QuizApiError('Tempo esgotado consultando o servidor.', 'timeout');
    }
    throw new QuizApiError('Erro de rede ao iniciar o quiz.', 'network');
  }
}

// --------------------- Tentativas (G-07) ---------------------

export type RemoteAttempt = StoredAttempt & { attemptId?: string };

export async function recordAttempt(
  input: RecordAttemptInput & { attemptId?: string }
): Promise<RemoteAttempt> {
  if (!isApiEnabled()) {
    return recordAttemptLocal(input);
  }

  try {
    const res = await fetchWithTimeout(() =>
      authorizedFetch('/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
    );
    if (!res.ok) throw mapHttpError(res.status, 'Não foi possível salvar a tentativa.');
    const data = await safeJson(res);

    return {
      id: typeof data.id === 'string' ? data.id : `srv-${Date.now()}`,
      finishedAt:
        typeof data.finishedAt === 'string' ? data.finishedAt : new Date().toISOString(),
      userId: input.userId,
      themeId: input.themeId,
      level: input.level,
      score: input.score,
      correctCount: input.correctCount,
      totalQuestions: input.totalQuestions,
      durationMs: input.durationMs,
      llmUsed: input.llmUsed,
      attemptId: input.attemptId,
    };
  } catch (e) {
    if (e instanceof QuizApiError) throw e;
    throw new QuizApiError('Erro de rede ao registrar tentativa.', 'network');
  }
}

export async function getAttemptsStatus(userId: string): Promise<AttemptsStatus> {
  if (!isApiEnabled()) return getAttemptsStatusLocal(userId);

  try {
    const res = await fetchWithTimeout(() => authorizedFetch('/attempts/status'));
    if (!res.ok) throw mapHttpError(res.status);
    const data = await safeJson(res);
    return {
      used: typeof data.used === 'number' ? data.used : 0,
      remaining: typeof data.remaining === 'number' ? data.remaining : 0,
      limit: typeof data.limit === 'number' ? data.limit : 3,
      canPlay: typeof data.canPlay === 'boolean' ? data.canPlay : false,
      resetsAtMs:
        typeof data.resetsAtMs === 'number'
          ? data.resetsAtMs
          : typeof data.resetsAt === 'string'
            ? +new Date(data.resetsAt)
            : Date.now() + 24 * 3600_000,
    };
  } catch {
    return getAttemptsStatusLocal(userId);
  }
}

export async function getUserAttempts(userId: string): Promise<StoredAttempt[]> {
  if (!isApiEnabled()) return getUserAttemptsLocal(userId);
  try {
    const res = await fetchWithTimeout(() => authorizedFetch('/attempts/me'));
    if (!res.ok) throw mapHttpError(res.status);
    const data = await safeJson(res);
    const list = Array.isArray(data.attempts) ? data.attempts : [];
    return list.filter((x): x is StoredAttempt => !!x && typeof x === 'object');
  } catch {
    return getUserAttemptsLocal(userId);
  }
}

export async function getUserStats(userId: string) {
  if (!isApiEnabled()) return getUserStatsLocal(userId);
  try {
    const res = await fetchWithTimeout(() => authorizedFetch('/attempts/me/stats'));
    if (!res.ok) throw mapHttpError(res.status);
    const data = await safeJson(res);
    return {
      attempts: typeof data.attempts === 'number' ? data.attempts : 0,
      bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
      totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
      averageScore: typeof data.averageScore === 'number' ? data.averageScore : 0,
      correctRate: typeof data.correctRate === 'number' ? data.correctRate : 0,
    };
  } catch {
    return getUserStatsLocal(userId);
  }
}

// --------------------- Ranking (R-01..R-03) ---------------------

export async function submitToRanking(entry: RankEntry): Promise<{ rank: number | null; totalAfter: number }> {
  if (!isApiEnabled()) return submitToRankingLocal(entry);
  // Backend já recalcula ranking quando a tentativa é registrada; aqui só consultamos posição.
  try {
    const res = await fetchWithTimeout(() =>
      authorizedFetch(`/ranking/me`, { method: 'GET' })
    );
    if (!res.ok) throw mapHttpError(res.status);
    const data = await safeJson(res);
    return {
      rank: typeof data.rank === 'number' ? data.rank : null,
      totalAfter: typeof data.total === 'number' ? data.total : 0,
    };
  } catch {
    return submitToRankingLocal(entry);
  }
}

export async function getTopRanking(limit: number = RANKING_LIMIT): Promise<RankEntry[]> {
  if (!isApiEnabled()) return getTopRankingLocal(limit);
  try {
    const res = await fetchWithTimeout(() =>
      authorizedFetch(`/ranking/top?limit=${encodeURIComponent(limit)}`)
    );
    if (!res.ok) throw mapHttpError(res.status);
    const data = await safeJson(res);
    const list = Array.isArray(data.ranking) ? data.ranking : [];
    return list
      .map((x) => (x && typeof x === 'object' ? (x as RankEntry) : null))
      .filter((x): x is RankEntry => !!x);
  } catch {
    return getTopRankingLocal(limit);
  }
}

export async function getUserRankPosition(userId: string) {
  if (!isApiEnabled()) return getUserRankPositionLocal(userId);
  try {
    const res = await fetchWithTimeout(() => authorizedFetch('/ranking/me'));
    if (!res.ok) throw mapHttpError(res.status);
    const data = await safeJson(res);
    return {
      rank: typeof data.rank === 'number' ? data.rank : null,
      entry: (data.entry as RankEntry | null) ?? null,
      total: typeof data.total === 'number' ? data.total : 0,
    };
  } catch {
    return getUserRankPositionLocal(userId);
  }
}

// --------------------- Dica via LLM (L-01) proxy ---------------------

export type RemoteHintResponse = {
  hint: string;
  source: 'remote';
};

export async function requestRemoteHint(questionId: string): Promise<RemoteHintResponse | null> {
  if (!isApiEnabled()) return null;
  try {
    const res = await fetchWithTimeout(
      () =>
        authorizedFetch('/quiz/hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId }),
        }),
      8000
    );
    if (!res.ok) return null;
    const data = await safeJson(res);
    const text = typeof data.hint === 'string' ? data.hint.trim() : '';
    return text ? { hint: text, source: 'remote' } : null;
  } catch {
    return null;
  }
}
