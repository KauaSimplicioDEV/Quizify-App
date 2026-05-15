import { secureDeleteItem, secureGetItem, secureSetItem } from '@/lib/secure-storage';

const ACCESS_TOKEN_KEY = 'quizify_access_token';
const REFRESH_TOKEN_KEY = 'quizify_refresh_token';
const USER_KEY = 'quizify_user_json';
const USED_NAMES_KEY = 'quizify_used_names_json';

export type StoredUser = {
  id: string;
  name: string;
};

function normalizePlayerName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function saveSession(
  accessToken: string,
  user: StoredUser,
  refreshToken?: string | null
): Promise<void> {
  await secureSetItem(ACCESS_TOKEN_KEY, accessToken);
  await secureSetItem(USER_KEY, JSON.stringify(user));
  if (refreshToken && refreshToken.length > 0) {
    await secureSetItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    await secureDeleteItem(REFRESH_TOKEN_KEY);
  }
}

export async function getAccessToken(): Promise<string | null> {
  return secureGetItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return secureGetItem(REFRESH_TOKEN_KEY);
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await secureGetItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await secureDeleteItem(ACCESS_TOKEN_KEY);
  await secureDeleteItem(REFRESH_TOKEN_KEY);
  await secureDeleteItem(USER_KEY);
}

async function getUsedNamesSet(): Promise<Set<string>> {
  const raw = await secureGetItem(USED_NAMES_KEY);
  if (!raw) return new Set();

  try {
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed.map(normalizePlayerName).filter(Boolean));
  } catch {
    return new Set();
  }
}

async function saveUsedNamesSet(names: Set<string>): Promise<void> {
  await secureSetItem(USED_NAMES_KEY, JSON.stringify([...names]));
}

export async function isPlayerNameTaken(name: string): Promise<boolean> {
  const normalized = normalizePlayerName(name);
  if (!normalized) return false;
  const names = await getUsedNamesSet();
  return names.has(normalized);
}

export async function registerPlayerName(name: string): Promise<void> {
  const normalized = normalizePlayerName(name);
  if (!normalized) return;
  const names = await getUsedNamesSet();
  names.add(normalized);
  await saveUsedNamesSet(names);
}
