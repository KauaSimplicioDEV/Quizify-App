import { HomeTheme } from '@/constants/home-theme';
import { QUIZ_THEMES, type QuizTheme, type QuizThemeId } from '@/lib/quiz/themes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * Roleta de temas (C-01).
 *
 * - Disposição radial: cada tema ocupa um setor de 360°/N graus.
 * - Ponteiro fixo no topo aponta para o setor central (0°).
 * - O botão "Girar" anima a rotação por várias voltas + o ângulo do tema sorteado.
 * - Ao terminar, dispara `onPick(themeId)`.
 */

type Props = {
  size?: number;
  onPick: (themeId: QuizThemeId) => void;
  disabled?: boolean;
};

export function ThemeWheel({ size = 280, onPick, disabled = false }: Props) {
  const themes = QUIZ_THEMES;
  const sectorAngle = 360 / themes.length;

  const rotation = useSharedValue(0);
  const [spinning, setSpinning] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const radius = size / 2;
  const innerRadius = radius - 36;

  const itemPositions = useMemo(() => {
    return themes.map((t, i) => {
      const angleDeg = i * sectorAngle - 90; // -90 para começar em cima
      const rad = (angleDeg * Math.PI) / 180;
      return {
        theme: t,
        angleDeg,
        x: Math.cos(rad) * innerRadius,
        y: Math.sin(rad) * innerRadius,
      };
    });
  }, [themes, sectorAngle, innerRadius]);

  const handlerRef = useRef<typeof onPick>(onPick);
  handlerRef.current = onPick;

  const spin = useCallback(() => {
    if (disabled || spinning) return;
    setSpinning(true);
    cancelAnimation(rotation);

    const targetIndex = Math.floor(Math.random() * themes.length);
    const fullTurns = 4 + Math.floor(Math.random() * 3); // 4..6 voltas
    const targetAngleForCenter = -(targetIndex * sectorAngle);
    const finalAngle = 360 * fullTurns + targetAngleForCenter;

    rotation.value = withTiming(finalAngle, {
      duration: 3200,
      easing: Easing.out(Easing.cubic),
    });

    const pickedTheme = themes[targetIndex]!;
    const timer = setTimeout(() => {
      setSpinning(false);
      handlerRef.current(pickedTheme.id);
    }, 3300);

    return () => clearTimeout(timer);
  }, [disabled, spinning, rotation, sectorAngle, themes]);

  useEffect(() => {
    return () => cancelAnimation(rotation);
  }, [rotation]);

  return (
    <View style={[styles.container, { width: size }]}>
      <View
        style={[
          styles.wheelArea,
          { width: size, height: size, borderRadius: radius },
        ]}>
        <Animated.View
          style={[
            styles.wheel,
            animatedStyle,
            {
              width: size,
              height: size,
              borderRadius: radius,
            },
          ]}>
          {itemPositions.map(({ theme, x, y }) => (
            <SectorChip key={theme.id} theme={theme} x={x + radius} y={y + radius} />
          ))}
        </Animated.View>

        <View pointerEvents="none" style={styles.center}>
          <Text style={styles.centerLogo}>Q</Text>
        </View>

        <View pointerEvents="none" style={styles.pointer}>
          <Text style={styles.pointerIcon}>▼</Text>
        </View>
      </View>

      <Pressable
        onPress={spin}
        disabled={disabled || spinning}
        style={({ pressed }) => [
          styles.spinBtn,
          (disabled || spinning) && styles.spinBtnDisabled,
          { opacity: pressed ? 0.85 : 1 },
        ]}>
        <Text style={styles.spinBtnText}>
          {spinning ? 'Sorteando…' : disabled ? 'Sem tentativas hoje' : 'Girar a roleta'}
        </Text>
      </Pressable>

      <Text style={styles.help}>
        O tema sorteado abre o quiz com 10 questões de dificuldades misturadas.
      </Text>
    </View>
  );
}

function SectorChip({
  theme,
  x,
  y,
}: {
  theme: QuizTheme;
  x: number;
  y: number;
}) {
  return (
    <View
      style={[
        styles.chip,
        {
          left: x - 32,
          top: y - 32,
          backgroundColor: theme.color + 'CC',
          borderColor: theme.color,
        },
      ]}>
      <Text style={styles.chipEmoji}>{theme.emoji}</Text>
      <Text style={styles.chipLabel} numberOfLines={1}>
        {theme.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  wheelArea: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: HomeTheme.glassBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  wheel: {
    position: 'absolute',
  },
  chip: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 4,
  },
  chipEmoji: { fontSize: 18 },
  chipLabel: {
    color: '#0f172a',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'center',
  },
  center: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: HomeTheme.yellow,
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
  },
  centerLogo: {
    color: HomeTheme.yellow,
    fontWeight: '900',
    fontSize: 24,
  },
  pointer: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -16,
    width: 32,
    alignItems: 'center',
  },
  pointerIcon: {
    fontSize: 28,
    color: HomeTheme.yellow,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  spinBtn: {
    marginTop: 22,
    backgroundColor: HomeTheme.yellow,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
  },
  spinBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  spinBtnText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 16,
  },
  help: {
    color: HomeTheme.textMuted,
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});
