import { HomeTheme } from '@/constants/home-theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  letter: string;
  text: string;
  selected: boolean;
  /** Definido somente quando há feedback visível. */
  state?: 'idle' | 'correct' | 'wrong';
  disabled?: boolean;
  onPress: () => void;
};

const STATE_STYLES = {
  idle: { borderColor: HomeTheme.glassBorder, bg: 'rgba(255,255,255,0.06)' },
  correct: { borderColor: '#22C55E', bg: 'rgba(34,197,94,0.18)' },
  wrong: { borderColor: '#EF4444', bg: 'rgba(239,68,68,0.18)' },
} as const;

const SELECTED = { borderColor: HomeTheme.link, bg: 'rgba(34,211,238,0.18)' };

export function AnswerOption({
  letter,
  text,
  selected,
  state = 'idle',
  disabled,
  onPress,
}: Props) {
  const variant = state !== 'idle' ? STATE_STYLES[state] : selected ? SELECTED : STATE_STYLES.idle;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: variant.bg,
          borderColor: variant.borderColor,
          opacity: pressed && !disabled ? 0.92 : 1,
        },
      ]}>
      <View style={[styles.badge, { borderColor: variant.borderColor }]}>
        <Text style={styles.badgeText}>{letter}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
    gap: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  badgeText: { color: HomeTheme.text, fontWeight: '900', fontSize: 14 },
  text: { color: HomeTheme.text, flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 21 },
});
