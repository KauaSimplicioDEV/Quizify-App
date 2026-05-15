import { HomeTheme } from '@/constants/home-theme';
import type { StoredUser } from '@/lib/auth-storage';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  user: StoredUser;
};

export function HomeHeader({ user }: Props) {
  const initial = user.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.greetingCol}>
          <Text style={styles.hi}>Olá,</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}!
          </Text>
        </View>
      </View>
      <View style={styles.welcomePill}>
        <Text style={styles.welcomeText}>Bem-vindo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: HomeTheme.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: HomeTheme.yellow, fontSize: 20, fontWeight: '800' },
  greetingCol: { flex: 1, minWidth: 0 },
  hi: { color: HomeTheme.textMuted, fontSize: 13 },
  name: { color: HomeTheme.text, fontWeight: '800', fontSize: 17, marginTop: 2 },
  welcomePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(91,33,182,0.45)',
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
  },
  welcomeText: {
    color: '#F5D0FE',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
