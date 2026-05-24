import { HomeTheme } from '@/constants/home-theme';
import type { AttemptLevel } from '@/lib/quiz/attempts';
import { getThemeById, QUIZ_LEVEL_META, type QuizThemeId } from '@/lib/quiz/themes';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  position: number;
  userName: string;
  themeId: QuizThemeId;
  level: AttemptLevel;
  score: number;
  durationMs: number;
  isCurrentUser?: boolean;
};

function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const mm = Math.floor(sec / 60).toString().padStart(2, '0');
  const ss = (sec % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

function levelDisplay(level: AttemptLevel): string {
  if (level === 'mixed') return '🎲 Mista';
  const meta = QUIZ_LEVEL_META[level];
  return `${meta.emoji} ${meta.label}`;
}

export function RankRow({
  position,
  userName,
  themeId,
  level,
  score,
  durationMs,
  isCurrentUser = false,
}: Props) {
  const theme = getThemeById(themeId);
  const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : null;

  return (
    <View
      style={[
        styles.row,
        isCurrentUser && {
          borderColor: HomeTheme.yellow,
          backgroundColor: 'rgba(255,225,53,0.10)',
        },
      ]}>
      <View style={styles.posCol}>
        {medal ? (
          <Text style={styles.medal}>{medal}</Text>
        ) : (
          <Text style={styles.pos}>#{position}</Text>
        )}
      </View>

      <View style={styles.mainCol}>
        <Text style={styles.name} numberOfLines={1}>
          {userName}
          {isCurrentUser ? '  (você)' : ''}
        </Text>
        <Text style={styles.meta}>
          {theme?.emoji ?? '❔'} {theme?.name ?? '—'} · {levelDisplay(level)} · ⏱ {formatDuration(durationMs)}
        </Text>
      </View>

      <Text style={styles.score}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 8,
    gap: 12,
  },
  posCol: { width: 40, alignItems: 'center' },
  medal: { fontSize: 22 },
  pos: { color: HomeTheme.textMuted, fontSize: 14, fontWeight: '800' },
  mainCol: { flex: 1, minWidth: 0 },
  name: { color: HomeTheme.text, fontSize: 15, fontWeight: '800' },
  meta: { color: HomeTheme.textMuted, fontSize: 12, marginTop: 2 },
  score: { color: HomeTheme.yellow, fontSize: 18, fontWeight: '900' },
});
