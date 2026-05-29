import { clearSession } from '@/lib/auth-storage';
import { secureDeleteItem, secureGetItem, secureSetItem } from '@/lib/secure-storage';
import { Platform } from 'react-native';

/** Chaves fixas com dados de usuário / sessão / progresso local. */
const FIXED_KEYS = [
  'quizify_access_token',
  'quizify_refresh_token',
  'quizify_user_json',
  'quizify_used_names_json',
  'quizify_attempts_v1',
  'quizify_ranking_v1',
  'quizify_login_attempts_v1',
  'quizify_dev_registered_emails_v1',
] as const;

const WIPE_FLAG_KEY = 'quizify_users_wiped_2026_05';

const WEB_PREFIX = '@quizify_secure:';
const TUTORIAL_KEY_PREFIX = `${WEB_PREFIX}quizify_tutorial_seen_v1:`;

/**
 * Remove todos os usuários e dados locais associados (sessão, nomes usados,
 * tentativas, ranking, flags de tutorial no mesmo aparelho).
 */
export async function clearAllLocalUserData(): Promise<void> {
  await clearSession();

  for (const key of FIXED_KEYS) {
    await secureDeleteItem(key);
  }

  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(TUTORIAL_KEY_PREFIX)) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  }
}

/** Executa a limpeza uma única vez (marca flag para não repetir). */
export async function runOneTimeUserDataWipe(): Promise<boolean> {
  const done = await secureGetItem(WIPE_FLAG_KEY);
  if (done === '1') return false;

  await clearAllLocalUserData();
  await secureSetItem(WIPE_FLAG_KEY, '1');
  return true;
}
