import { GlassCard } from '@/components/home/glass-card';
import { HomeTheme } from '@/constants/home-theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type GameRow = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  playColor: string;
  playLabel: string;
};

const ROWS: GameRow[] = [
  {
    id: '1',
    title: 'Quiz Nível Fácil',
    subtitle: 'Tecnologia e lógica',
    emoji: '🧩',
    playColor: '#EAB308',
    playLabel: 'Jogar',
  },
  {
    id: '2',
    title: 'Quiz Nível Médio',
    subtitle: 'Desafio equilibrado',
    emoji: '⚡',
    playColor: '#94A3B8',
    playLabel: 'Jogar',
  },
  {
    id: '3',
    title: 'Quiz Nível Difícil',
    subtitle: 'Para experts',
    emoji: '🚀',
    playColor: HomeTheme.cyan,
    playLabel: 'Jogar',
  },
];

type Props = {
  onPlay: (levelId: string) => void;
};

export function PlayMoreSection({ onPlay }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Escolha seu nível</Text>
      </View>
      {ROWS.map((row) => (
        <GlassCard key={row.id} style={styles.rowCard} padding={14}>
          <View style={styles.rowInner}>
            <View style={styles.iconBox}>
              <Text style={styles.emoji}>{row.emoji}</Text>
            </View>
            <View style={styles.textCol}>
              <Text style={styles.title}>{row.title}</Text>
              <Text style={styles.subtitle}>{row.subtitle}</Text>
            </View>
            <Pressable
              onPress={() => onPlay(row.id)}
              style={({ pressed }) => [
                styles.playBtn,
                {
                  backgroundColor: row.playColor,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <Text style={styles.playText}>{row.playLabel}</Text>
            </Pressable>
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { color: HomeTheme.text, fontSize: 18, fontWeight: '800' },
  rowCard: { marginBottom: 10 },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
  textCol: { flex: 1, minWidth: 0 },
  title: { color: HomeTheme.text, fontSize: 15, fontWeight: '800' },
  subtitle: { color: HomeTheme.textMuted, fontSize: 12, marginTop: 2 },
  playBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  playText: { color: '#0f172a', fontWeight: '900', fontSize: 13 },
});
