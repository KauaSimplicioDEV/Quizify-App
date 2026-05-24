/** Largura mínima (px) para tratar como tablet (iPad portrait ~768). */
export const TABLET_MIN_WIDTH = 768;

/** iPad Pro / telas largas em landscape na feira. */
export const LARGE_TABLET_MIN_WIDTH = 1024;

/** Largura máxima do conteúdo centralizado em telas largas. */
export const CONTENT_MAX_WIDTH = {
  tablet: 720,
  largeTablet: 840,
  auth: 520,
  modal: 480,
  quizOptions: 640,
} as const;

/** Tab bar flutuante não deve esticar em iPad. */
export const TAB_BAR_MAX_WIDTH = 560;
