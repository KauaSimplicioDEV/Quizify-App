import type { Href } from 'expo-router';

/** Rotas usadas fora dos componentes Link; `as Href` até o gerador de rotas atualizar. */
export const AUTH_LOGIN = '/(auth)/login' as Href;
export const TABS_ROOT = '/(tabs)' as Href;
export const INTRO_ROUTE = '/intro' as Href;
export const ONBOARDING_ROUTE = '/onboarding' as Href;

/** Splash + carregamento das questões antes do jogo. */
export const QUIZ_START_ROUTE = '/quiz/start' as Href;
export const QUIZ_PLAY_ROUTE = '/quiz/play' as Href;
export const QUIZ_RESULT_ROUTE = '/quiz/result' as Href;
