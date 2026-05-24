import { secureDeleteItem, secureGetItem, secureSetItem } from '@/lib/secure-storage';

/**
 * Persistência da flag de tutorial visto (T-03 / O-01 / O-03).
 *
 * Chave por usuário, para que diferentes contas possam ter o seu próprio estado
 * de "tutorial visto" no mesmo dispositivo.
 */

function keyFor(userId: string): string {
  return `quizify_tutorial_seen_v1:${userId}`;
}

export async function hasSeenTutorial(userId: string): Promise<boolean> {
  const raw = await secureGetItem(keyFor(userId));
  return raw === '1';
}

export async function markTutorialSeen(userId: string): Promise<void> {
  await secureSetItem(keyFor(userId), '1');
}

export async function resetTutorial(userId: string): Promise<void> {
  await secureDeleteItem(keyFor(userId));
}
