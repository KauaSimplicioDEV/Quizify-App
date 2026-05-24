import { HomeTheme } from '@/constants/home-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Padding interno (default 18 no telefone, 22 no tablet). */
  padding?: number;
};

export function GlassCard({ children, style, padding }: Props) {
  const { isTablet } = useResponsive();
  const innerPadding = padding ?? (isTablet ? 22 : 18);
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.shell, styles.webGlass, style]}>
        <View style={[styles.inner, { padding: innerPadding }]}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.shell, style]}>
      <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.inner, { padding: innerPadding }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
  },
  webGlass: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  inner: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
