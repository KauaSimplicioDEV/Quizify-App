import type { StoredUser } from '@/lib/auth-storage';
import { getApiBase } from '@/lib/api-config';
import { devIsRegistered, devRegisterEmail } from '@/lib/dev-auth-registry';
import { normalizeEmail } from '@/lib/validation';

export type AuthSession = {
  accessToken: string;
  /** Quando o backend enviar `refreshToken` / `refresh_token`. */
  refreshToken?: string;
  user: StoredUser;
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    public code:
      | 'invalid_credentials'
      | 'blocked'
      | 'network'
      | 'validation'
      | 'email_exists'
      | 'config'
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

type TokenResponse = {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: StoredUser;
  message?: string;
  code?: string;
};

function parseTokens(data: TokenResponse): { accessToken: string; refreshToken?: string } | null {
  const accessToken = data.accessToken ?? data.access_token;
  if (!accessToken) return null;
  const refreshToken = data.refreshToken ?? data.refresh_token;
  return { accessToken, refreshToken: refreshToken || undefined };
}

function buildMockToken(email: string): string {
  return `dev-mock-${normalizeEmail(email)}-${Date.now()}`;
}

async function loginWithApi(email: string, password: string): Promise<AuthSession> {
  const base = getApiBase();
  if (!base) throw new AuthApiError('API não configurada.', 'config');

  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: normalizeEmail(email), password }),
  });

  const data = (await res.json().catch(() => ({}))) as TokenResponse;

  if (res.status === 423 || data.code === 'blocked') {
    throw new AuthApiError(data.message ?? 'Conta temporariamente bloqueada.', 'blocked');
  }

  if (!res.ok) {
    throw new AuthApiError(data.message ?? 'E-mail ou senha incorretos.', 'invalid_credentials');
  }

  const tokens = parseTokens(data);
  if (!tokens || !data.user?.email) {
    throw new AuthApiError('Resposta inválida do servidor.', 'network');
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: data.user,
  };
}

async function registerWithApi(name: string, email: string, password: string): Promise<AuthSession> {
  const base = getApiBase();
  if (!base) throw new AuthApiError('API não configurada.', 'config');

  const res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name: name.trim(),
      email: normalizeEmail(email),
      password,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as TokenResponse;

  if (res.status === 409) {
    throw new AuthApiError(data.message ?? 'Este e-mail já está cadastrado.', 'email_exists');
  }

  if (!res.ok) {
    throw new AuthApiError(data.message ?? 'Não foi possível concluir o cadastro.', 'validation');
  }

  const tokens = parseTokens(data);
  if (!tokens || !data.user?.email) {
    throw new AuthApiError('Resposta inválida do servidor.', 'network');
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: data.user,
  };
}

async function loginDevMock(email: string, password: string): Promise<AuthSession> {
  const norm = normalizeEmail(email);
  const registered = await devIsRegistered(norm);
  if (!registered) {
    throw new AuthApiError('E-mail ou senha incorretos.', 'invalid_credentials');
  }
  if (password.length < 8) {
    throw new AuthApiError('E-mail ou senha incorretos.', 'invalid_credentials');
  }

  return {
    accessToken: buildMockToken(norm),
    user: {
      id: `dev-${norm}`,
      email: norm,
      name: norm.split('@')[0] ?? 'Usuário',
    },
  };
}

async function registerDevMock(name: string, email: string): Promise<AuthSession> {
  const norm = normalizeEmail(email);
  const result = await devRegisterEmail(norm);
  if (result === 'exists') {
    throw new AuthApiError('Este e-mail já está cadastrado.', 'email_exists');
  }

  return {
    accessToken: buildMockToken(norm),
    user: {
      id: `dev-${norm}`,
      email: norm,
      name: name.trim() || norm.split('@')[0] || 'Usuário',
    },
  };
}

export async function requestLogin(email: string, password: string): Promise<AuthSession> {
  const base = getApiBase();
  if (base) {
    return loginWithApi(email, password);
  }
  if (__DEV__) {
    return loginDevMock(email, password);
  }
  throw new AuthApiError('Defina EXPO_PUBLIC_API_URL para usar o app em produção.', 'config');
}

export async function requestRegister(
  name: string,
  email: string,
  password: string
): Promise<AuthSession> {
  const base = getApiBase();
  if (base) {
    return registerWithApi(name, email, password);
  }
  if (__DEV__) {
    return registerDevMock(name, email);
  }
  throw new AuthApiError('Defina EXPO_PUBLIC_API_URL para usar o app em produção.', 'config');
}

/**
 * Solicita e-mail de redefinição de senha (`POST /auth/forgot-password`).
 * O backend deve responder de forma uniforme (ex.: 204) para não expor se o e-mail existe.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const base = getApiBase();
  if (!base) {
    throw new AuthApiError(
      __DEV__
        ? 'Recuperação de senha requer API. Configure EXPO_PUBLIC_API_URL ou use o fluxo quando o backend estiver disponível.'
        : 'API não configurada.',
      'config'
    );
  }

  const res = await fetch(`${base}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: normalizeEmail(email) }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new AuthApiError(
      data.message ?? 'Não foi possível enviar o pedido de recuperação. Tente novamente.',
      'network'
    );
  }
}
