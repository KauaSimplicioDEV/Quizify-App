/**
 * Temas de Tecnologia cobertos pelo Quizify (C-02).
 *
 * Cada tema tem 30 questões totais (3 níveis × 10), em alinhamento ao requisito
 * `G-04` (10 questões por tentativa, até 3 tentativas → 30 questões por tema).
 */

export type QuizTheme = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Cor de destaque em UI relacionada (ranking, histórico). */
  color: string;
};

export const QUIZ_THEMES: readonly QuizTheme[] = [
  {
    id: 'languages',
    name: 'Linguagens',
    emoji: '💻',
    description: 'JavaScript, TypeScript, Python, Java e mais.',
    color: '#F59E0B',
  },
  {
    id: 'logic',
    name: 'Lógica',
    emoji: '🧠',
    description: 'Raciocínio lógico e algoritmos básicos.',
    color: '#22D3EE',
  },
  {
    id: 'data-structures',
    name: 'Estruturas de Dados',
    emoji: '🧩',
    description: 'Listas, pilhas, filas, árvores e grafos.',
    color: '#A78BFA',
  },
  {
    id: 'networks',
    name: 'Redes',
    emoji: '🌐',
    description: 'HTTP, TCP/IP, DNS e protocolos.',
    color: '#34D399',
  },
  {
    id: 'databases',
    name: 'Bancos de Dados',
    emoji: '🗄️',
    description: 'SQL, NoSQL, normalização e índices.',
    color: '#FB7185',
  },
  {
    id: 'auth-tokens',
    name: 'Autenticação & Tokens',
    emoji: '🔐',
    description: 'OAuth, JWT, hashing e sessão.',
    color: '#60A5FA',
  },
  {
    id: 'ai',
    name: 'IA',
    emoji: '🤖',
    description: 'Conceitos de Inteligência Artificial e LLMs.',
    color: '#F472B6',
  },
] as const;

export type QuizThemeId = (typeof QUIZ_THEMES)[number]['id'];

export function getThemeById(id: string): QuizTheme | undefined {
  return QUIZ_THEMES.find((t) => t.id === id);
}

export type QuizLevel = 'easy' | 'medium' | 'hard';

export const QUIZ_LEVELS: readonly QuizLevel[] = ['easy', 'medium', 'hard'] as const;

export const QUIZ_LEVEL_META: Record<
  QuizLevel,
  { label: string; emoji: string; color: string; multiplier: number }
> = {
  easy: { label: 'Fácil', emoji: '🟢', color: '#22C55E', multiplier: 1 },
  medium: { label: 'Médio', emoji: '🟡', color: '#EAB308', multiplier: 1.5 },
  hard: { label: 'Difícil', emoji: '🔴', color: '#EF4444', multiplier: 2 },
};
