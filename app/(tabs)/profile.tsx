import { GlassCard } from '@/components/home/glass-card';
import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />
      <View style={[styles.body, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}>
        <Text style={styles.title}>Perfil</Text>
        <GlassCard style={{ marginTop: 20 }}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{user.name}</Text>
        </GlassCard>
        <Pressable
          onPress={() => void signOut()}
          style={({ pressed }) => [styles.signOut, { opacity: pressed ? 0.85 : 1 }]}>
          <Text style={styles.signOutText}>Trocar nome</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
  body: { flex: 1, paddingHorizontal: 20 },
  title: { color: HomeTheme.text, fontSize: 28, fontWeight: '900' },
  label: { color: HomeTheme.textMuted, fontSize: 13, fontWeight: '600' },
  value: { color: HomeTheme.text, fontSize: 17, fontWeight: '700', marginTop: 4 },
  signOut: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HomeTheme.coral,
    backgroundColor: 'rgba(255,107,74,0.15)',
  },
  signOutText: { color: HomeTheme.coral, fontSize: 16, fontWeight: '800' },
});
