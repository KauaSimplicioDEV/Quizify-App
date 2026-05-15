import { HomeHeader } from '@/components/home/home-header';
import { HowItWorksCard } from '@/components/home/how-it-works-card';
import { PlayMoreSection } from '@/components/home/play-more-section';
import { HomeTheme } from '@/constants/home-theme';
import { useAuth } from '@/contexts/auth-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user) return null;

  const handlePlay = (_levelId: string) => {
    // TODO: navegar para a tela do quiz no nível selecionado.
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[...HomeTheme.pageGradient]} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <HomeHeader user={user} />
        <HowItWorksCard />
        <PlayMoreSection onPlay={handlePlay} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050a14' },
  scroll: { paddingHorizontal: 20 },
});
