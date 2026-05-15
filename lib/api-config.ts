/**
 * URL base da API (HTTPS). Sem barra no final.
 * Defina `EXPO_PUBLIC_API_URL` no ambiente Expo.
 */
export function getApiBase(): string | undefined {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/$/, '');
}
