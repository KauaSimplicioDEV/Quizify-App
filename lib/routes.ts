import type { Href } from 'expo-router';

/** Rotas usadas fora dos componentes Link; `as Href` até o gerador de rotas incluir `(auth)`. */
export const AUTH_LOGIN = '/(auth)/login' as Href;
export const TABS_ROOT = '/(tabs)' as Href;
export const INTRO_ROUTE = '/intro' as Href;
