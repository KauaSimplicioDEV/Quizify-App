import {
  CONTENT_MAX_WIDTH,
  LARGE_TABLET_MIN_WIDTH,
  TAB_BAR_MAX_WIDTH,
  TABLET_MIN_WIDTH,
} from '@/constants/layout';
import { useMemo } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';

export type ResponsiveLayout = {
  width: number;
  height: number;
  isTablet: boolean;
  isLargeTablet: boolean;
  isLandscape: boolean;
  contentMaxWidth: number;
  horizontalPadding: number;
  /** Multiplicador de fonte (~15% maior no tablet). */
  fontScale: number;
  trophyColumns: number;
  trophyCardWidth: number;
  tabBarMaxWidth: number;
  tabBarHorizontalInset: number;
  tabBarHeight: number;
  tabBarClearance: number;
  tabBarLabelSize: number;
  tabBarIconSize: number;
  /** Estilo para centralizar conteúdo em ScrollView / View. */
  contentFrameStyle: ViewStyle;
  /** Escala um valor de fonte para tablet. */
  scaleFont: (size: number) => number;
};

export function useResponsive(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const shortEdge = Math.min(width, height);
    const isTablet = width >= TABLET_MIN_WIDTH;
    const isLargeTablet = width >= LARGE_TABLET_MIN_WIDTH;
    const isLandscape = width > height;

    const contentMaxWidth = isLargeTablet
      ? CONTENT_MAX_WIDTH.largeTablet
      : isTablet
        ? CONTENT_MAX_WIDTH.tablet
        : width;

    const horizontalPadding = isLargeTablet ? 48 : isTablet ? 32 : 20;
    const fontScale = isTablet ? 1.15 : 1;

    const trophyColumns = isLargeTablet ? 4 : isTablet ? 3 : 2;
    const trophyGap = 12;
    const innerWidth = Math.min(width, contentMaxWidth);
    const trophyCardWidth =
      (innerWidth - horizontalPadding * 2 - trophyGap * (trophyColumns - 1)) / trophyColumns;

    const tabBarHorizontalInset = isTablet
      ? Math.max((width - TAB_BAR_MAX_WIDTH) / 2, 32)
      : 18;

    const contentFrameStyle: ViewStyle = {
      width: '100%',
      maxWidth: contentMaxWidth,
      alignSelf: 'center',
      paddingHorizontal: horizontalPadding,
    };

    return {
      width,
      height,
      isTablet,
      isLargeTablet,
      isLandscape,
      contentMaxWidth,
      horizontalPadding,
      fontScale,
      trophyColumns,
      trophyCardWidth,
      tabBarMaxWidth: TAB_BAR_MAX_WIDTH,
      tabBarHorizontalInset,
      tabBarHeight: isTablet ? 66 : 58,
      tabBarClearance: isTablet ? 128 : 110,
      tabBarLabelSize: isTablet ? 12 : 11,
      tabBarIconSize: isTablet ? 28 : 24,
      contentFrameStyle,
      scaleFont: (size: number) => Math.round(size * fontScale),
    };
  }, [width, height]);
}
