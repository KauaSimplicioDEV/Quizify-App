import { AuthHero } from '@/constants/auth-hero-theme';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

type Props = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  /** Fundo roxo hero: labels claros e campos claros. */
  variant?: 'default' | 'hero';
};

export function AuthTextField({
  label,
  error,
  containerStyle,
  style,
  variant = 'default',
  ...rest
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const border = useThemeColor({ light: '#E0E0E0', dark: '#3A3A3C' }, 'icon');
  const inputBg = useThemeColor({ light: '#F5F5F5', dark: '#1C1C1E' }, 'background');
  const placeholder = Colors[scheme].icon;
  const color = useThemeColor({}, 'text');

  const hero = variant === 'hero';
  const borderColor = error ? '#DC2626' : hero ? AuthHero.fieldBorder : border;
  const bg = hero ? AuthHero.fieldBg : inputBg;
  const textColor = hero ? AuthHero.fieldText : color;
  const ph = hero ? 'rgba(30,27,75,0.45)' : placeholder;

  return (
    <View style={[styles.wrap, containerStyle]}>
      {hero ? (
        <Text style={styles.heroLabel}>{label}</Text>
      ) : (
        <ThemedText type="defaultSemiBold" style={styles.label}>
          {label}
        </ThemedText>
      )}
      <TextInput
        placeholderTextColor={ph}
        style={[
          styles.input,
          hero && styles.inputHero,
          { borderColor: borderColor, backgroundColor: bg, color: textColor },
          style,
        ]}
        {...rest}
      />
      {error ? (
        hero ? (
          <Text style={styles.errorHero}>{error}</Text>
        ) : (
          <ThemedText style={styles.errorDefault} lightColor="#C62828" darkColor="#FF8A80">
            {error}
          </ThemedText>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { marginBottom: 6 },
  heroLabel: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputHero: {
    borderRadius: 16,
    borderWidth: 2,
    fontWeight: '500',
  },
  errorHero: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: AuthHero.error,
  },
  errorDefault: { marginTop: 4, fontSize: 13 },
});
