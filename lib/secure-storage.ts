import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const WEB_PREFIX = '@quizify_secure:';

/**
 * Armazenamento sensível: Keychain/Keystore no nativo; na web o módulo nativo não existe
 * (ExpoSecureStore vazio), então usamos localStorage apenas para desenvolvimento web.
 */
export async function secureGetItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(WEB_PREFIX + key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function secureSetItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage indisponível');
    }
    localStorage.setItem(WEB_PREFIX + key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function secureDeleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(WEB_PREFIX + key);
      }
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* já ausente */
  }
}
