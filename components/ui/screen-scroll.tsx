import { useResponsive } from '@/hooks/use-responsive';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = ScrollViewProps & {
  children: React.ReactNode;
  /** Reserva espaço para a tab bar flutuante (default true). */
  withTabBar?: boolean;
  /** Padding extra no topo além da safe area (default 12). */
  topExtra?: number;
};

/**
 * ScrollView com conteúdo centralizado e padding responsivo (iPad / feira).
 */
export function ScreenScroll({
  children,
  contentContainerStyle,
  withTabBar = true,
  topExtra = 12,
  showsVerticalScrollIndicator = false,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();
  const { contentFrameStyle, tabBarClearance } = useResponsive();

  return (
    <ScrollView
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      contentContainerStyle={[
        contentFrameStyle,
        {
          paddingTop: insets.top + topExtra,
          paddingBottom: insets.bottom + (withTabBar ? tabBarClearance : 24),
        },
        contentContainerStyle,
      ]}
      {...rest}>
      {children}
    </ScrollView>
  );
}

/**
 * View de tela cheia com frame responsivo (intro, wheel, etc.).
 */
export function ScreenFrame({
  children,
  style,
  withTabBar = false,
  topExtra = 14,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  withTabBar?: boolean;
  topExtra?: number;
}) {
  const insets = useSafeAreaInsets();
  const { contentFrameStyle, tabBarClearance } = useResponsive();

  return (
    <View
      style={[
        styles.frame,
        contentFrameStyle,
        {
          paddingTop: insets.top + topExtra,
          paddingBottom: insets.bottom + (withTabBar ? tabBarClearance : 26),
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
});
