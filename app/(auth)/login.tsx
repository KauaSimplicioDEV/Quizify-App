import { AuthHeroBackground } from '@/components/auth/auth-hero-background';
import { AuthPillButton } from '@/components/auth/auth-pill-button';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { AuthHero } from '@/constants/auth-hero-theme';
import { useAuth } from '@/contexts/auth-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { identify } = useAuth();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    setNameError('');
    setFormError('');
    if (!name.trim()) {
      setNameError('Informe seu nome.');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Use pelo menos 2 caracteres.');
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setFormError('');
    try {
      await identify(name);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthHeroBackground>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.logo}>Quizify</Text>
          <Text style={styles.tagline}>Antes de jogar, diga seu nome</Text>

          <AuthTextField
            variant="hero"
            label="Nome"
            value={name}
            onChangeText={setName}
            error={nameError}
            autoCapitalize="words"
            autoComplete="name"
            autoCorrect={false}
          />

          {formError ? (
            <View style={styles.formErrorBox}>
              <Text style={styles.formErrorText}>{formError}</Text>
            </View>
          ) : null}

          <AuthPillButton
            label="Entrar no jogo"
            onPress={() => void onSubmit()}
            loading={submitting}
            disabled={submitting}
            backgroundColor={AuthHero.loginCyan}
            pressedBackgroundColor={AuthHero.loginCyanPressed}
            style={styles.mainBtn}
          />
          <Text style={styles.hint}>Seu nome será exibido no app e no ranking.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthHeroBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, maxWidth: 480, width: '100%', alignSelf: 'center' },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    color: AuthHero.logoYellow,
    letterSpacing: 1,
    marginBottom: 6,
    textShadowColor: AuthHero.logoOutline,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: AuthHero.subtitle,
    marginBottom: 32,
  },
  formErrorBox: {
    backgroundColor: 'rgba(220, 38, 38, 0.22)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.45)',
  },
  formErrorText: { color: '#FEE2E2', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  mainBtn: { marginTop: 6 },
  hint: {
    marginTop: 18,
    fontSize: 13,
    color: AuthHero.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
