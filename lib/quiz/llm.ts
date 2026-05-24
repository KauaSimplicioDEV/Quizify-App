import type { QuizQuestion } from '@/lib/quiz/questions/types';

/**
 * Integração com LLM (L-01 .. L-04).
 *
 * Decisões de produto:
 * - **L-02**: Exatamente 1 uso por tentativa, controlado pelo `quiz-context`.
 * - **L-03**: O usuário pede uma **dica** sobre a questão atual. O sistema deve devolver
 *   uma pista útil que NÃO revele a resposta correta (texto curto).
 * - **L-04**: timeout curto, sem retry agressivo. Em caso de falha (rede/quota/config),
 *   cai para uma dica local pré-curada (`hint` da própria questão).
 *
 * Provedor:
 * - Se `EXPO_PUBLIC_LLM_API_KEY` estiver definido, faz uma chamada simples ao Google
 *   Gemini (free tier). Em produção real, esta chave deveria ficar no backend (proxy).
 * - Sem chave, usa o fallback local.
 *
 * Segurança: nunca envie a alternativa correta ao prompt; só o enunciado e as opções,
 * para evitar que o modelo apenas repita a resposta.
 */

const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const TIMEOUT_MS = 8000;

function getApiKey(): string | undefined {
  const key = process.env.EXPO_PUBLIC_LLM_API_KEY;
  if (!key || typeof key !== 'string') return undefined;
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export type HintResult = {
  hint: string;
  /** "remote" quando vem do LLM real; "local" quando é fallback. */
  source: 'remote' | 'local';
};

export type HintErrorCode = 'timeout' | 'network' | 'quota' | 'config' | 'unknown';

export class LlmError extends Error {
  constructor(message: string, public code: HintErrorCode) {
    super(message);
    this.name = 'LlmError';
  }
}

function buildPrompt(question: QuizQuestion): string {
  const options = question.options
    .map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`)
    .join('\n');

  return `Sou um jogador de um app de quiz sobre Tecnologia. Estou em dúvida na questão abaixo.\n\n` +
    `Enunciado: ${question.prompt}\n` +
    `Alternativas:\n${options}\n\n` +
    `Me dê **uma única dica curta (máx. 25 palavras)** em português brasileiro que ` +
    `me ajude a pensar, **sem revelar qual é a alternativa correta**. ` +
    `Não diga "A resposta é X". Apenas oriente o raciocínio.`;
}

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
  }[];
};

async function callGemini(prompt: string, signal: AbortSignal): Promise<string> {
  const key = getApiKey();
  if (!key) throw new LlmError('EXPO_PUBLIC_LLM_API_KEY não definido.', 'config');

  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 80 },
    }),
    signal,
  });

  if (res.status === 429) {
    throw new LlmError('Cota de IA esgotada por agora.', 'quota');
  }
  if (!res.ok) {
    throw new LlmError(`Falha do provedor (${res.status}).`, 'network');
  }

  const data = (await res.json().catch(() => ({}))) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new LlmError('Resposta vazia do provedor.', 'unknown');
  }
  return text;
}

/**
 * Solicita uma dica para a questão atual.
 * - Tenta o provedor remoto (se houver chave) com timeout curto.
 * - Sempre devolve uma dica útil (cai no fallback local sem propagar erro).
 */
export async function requestHint(question: QuizQuestion): Promise<HintResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return { hint: question.hint, source: 'local' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const text = await callGemini(buildPrompt(question), controller.signal);
    return { hint: text, source: 'remote' };
  } catch {
    return { hint: question.hint, source: 'local' };
  } finally {
    clearTimeout(timer);
  }
}
