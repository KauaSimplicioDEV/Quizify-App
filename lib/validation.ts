const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim().toLowerCase());
}

/** Mínimo 8 caracteres, pelo menos uma letra e um número (S-02). */
export function isValidPassword(password: string): { ok: boolean; message?: string } {
  if (password.length < 8) {
    return { ok: false, message: 'A senha deve ter pelo menos 8 caracteres.' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { ok: false, message: 'A senha deve conter pelo menos uma letra.' };
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false, message: 'A senha deve conter pelo menos um número.' };
  }
  return { ok: true };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
