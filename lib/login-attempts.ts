import { secureDeleteItem, secureGetItem, secureSetItem } from '@/lib/secure-storage';

const KEY = 'quizify_login_attempts_v1';

const MAX_FAILURES = 3;
const BLOCK_MS = 15 * 60 * 1000;

type Entry = {
  failures: number;
  blockedUntil: number | null;
};

type StoreShape = Record<string, Entry>;

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await secureGetItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoreShape;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function writeStore(data: StoreShape): Promise<void> {
  await secureSetItem(KEY, JSON.stringify(data));
}

export type LoginBlockState =
  | { blocked: false; failuresSoFar: number; failuresUntilBlock: number }
  | { blocked: true; retryAfterMs: number };

export async function getLoginBlockState(emailKey: string): Promise<LoginBlockState> {
  const store = await readStore();
  const entry = store[emailKey];
  const now = Date.now();

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { blocked: true, retryAfterMs: entry.blockedUntil - now };
  }

  if (entry?.blockedUntil && now >= entry.blockedUntil) {
    const next = { ...store, [emailKey]: { failures: 0, blockedUntil: null } };
    await writeStore(next);
    return { blocked: false, failuresSoFar: 0, failuresUntilBlock: MAX_FAILURES };
  }

  const failures = entry?.failures ?? 0;
  return {
    blocked: false,
    failuresSoFar: failures,
    failuresUntilBlock: Math.max(0, MAX_FAILURES - failures),
  };
}

export async function recordLoginFailure(emailKey: string): Promise<void> {
  const store = await readStore();
  const now = Date.now();
  const prev = store[emailKey];
  let failures = (prev?.failures ?? 0) + 1;
  let blockedUntil: number | null = null;

  if (prev?.blockedUntil && now < prev.blockedUntil) {
    blockedUntil = prev.blockedUntil;
    failures = prev.failures;
  } else if (failures >= MAX_FAILURES) {
    blockedUntil = now + BLOCK_MS;
  }

  await writeStore({ ...store, [emailKey]: { failures, blockedUntil } });
}

export async function clearLoginFailures(emailKey: string): Promise<void> {
  const store = await readStore();
  if (!store[emailKey]) return;
  const next = { ...store };
  delete next[emailKey];
  await writeStore(next);
}
