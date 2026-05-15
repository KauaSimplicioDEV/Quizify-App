import { getApiBase } from '@/lib/api-config';
import { getAccessToken } from '@/lib/auth-storage';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * `fetch` para rotas protegidas: envia `Authorization: Bearer <accessToken>`.
 * Use quando o backend exigir JWT (exceto login/register/forgot-password).
 */
export async function authorizedFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBase();
  if (!base) {
    throw new ApiClientError('API não configurada.', 0, 'config');
  }
  const token = await getAccessToken();
  if (!token) {
    throw new ApiClientError('Sessão não encontrada. Faça login novamente.', 401, 'unauthorized');
  }

  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  return fetch(url, { ...init, headers });
}
