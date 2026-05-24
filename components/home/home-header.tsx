import { HomeTheme } from '@/constants/home-theme';
import { useResponsive } from '@/hooks/use-responsive';
import type { StoredUser } from '@/lib/auth-storage';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  user: StoredUser;
};

export function HomeHeader({ user }: Props) {
  const { isTablet, scaleFont } = useResponsive();
  const initial = user.name.trim().charAt(0).toUpperCase() || '?';
  const avatarSize = isTablet ? 56 : 48;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View
          style={[
            styles.avatar,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}>
          <Text style={[styles.avatarText, { fontSize: scaleFont(20) }]}>{initial}</Text>
        </View>
        <View style={styles.greetingCol}>
          <Text style={[styles.hi, { fontSize: scaleFont(13) }]}>Olá,</Text>
          <Text style={[styles.name, { fontSize: scaleFont(17) }]} numberOfLines={1}>
            {user.name}!
          </Text>
        </View>
      </View>
      <View style={styles.welcomePill}>
        <Text style={[styles.welcomeText, { fontSize: scaleFont(12) }]}>Bem-vindo</Text>
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: HomeTheme.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: HomeTheme.yellow, fontWeight: '800' },
  greetingCol: { flex: 1, minWidth: 0 },
  hi: { color: HomeTheme.textMuted },
  name: { color: HomeTheme.text, fontWeight: '800', marginTop: 2 },
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
    letterSpacing: 0.5,
  },
});
