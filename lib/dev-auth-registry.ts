/**
 * Registro local apenas em __DEV__ quando não há API, para testar login/cadastro.
 * Em produção com API, este módulo não deve ser usado.
 */
import { secureGetItem, secureSetItem } from '@/lib/secure-storage';

const KEY = 'quizify_dev_registered_emails_v1';

export async function devListEmails(): Promise<string[]> {
  const raw = await secureGetItem(KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr.filter((e): e is string => typeof e === 'string') : [];
  } catch {
    return [];
  }
}

export async function devRegisterEmail(email: string): Promise<'ok' | 'exists'> {
  const list = await devListEmails();
  const e = email.toLowerCase();
  if (list.includes(e)) return 'exists';
  list.push(e);
  await secureSetItem(KEY, JSON.stringify(list));
  return 'ok';
}

export async function devIsRegistered(email: string): Promise<boolean> {
  const list = await devListEmails();
  return list.includes(email.toLowerCase());
}
