import { AuthHero } from '@/constants/auth-hero-theme';

/** Fundo e vidro alinhados à paleta das telas de auth (roxo + ciano + coral). */
export const HomeTheme = {
  pageGradient: ['#050a14', '#0f1729', '#1E0538', '#312e81', '#0e7490'] as const,
  glassBorder: 'rgba(255,255,255,0.22)',
  glassHighlight: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  textMuted: AuthHero.muted,
  yellow: AuthHero.logoYellow,
  cyan: AuthHero.loginCyan,
  coral: AuthHero.registerCoral,
  link: AuthHero.linkCyan,
  purpleBtn: ['#5B21B6', '#7c3aed'] as const,
  tabBarBg: 'rgba(10, 8, 28, 0.65)',
} as const;
