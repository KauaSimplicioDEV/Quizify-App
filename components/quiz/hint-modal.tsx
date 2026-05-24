import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { HomeTheme } from '@/constants/home-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  hint?: string;
  source?: 'remote' | 'local';
};

export function HintModal({ visible, onClose, loading, hint, source }: Props) {
  const { horizontalPadding, scaleFont } = useResponsive();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { fontSize: scaleFont(20) }]}>💡 Dica</Text>
            {source ? (
              <Text style={styles.tag}>
                {source === 'remote' ? 'IA' : 'modo offline'}
              </Text>
            ) : null}
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={HomeTheme.link} />
              <Text style={styles.loadingText}>Gerando sua dica…</Text>
            </View>
          ) : (
            <Text style={[styles.hint, { fontSize: scaleFont(15), lineHeight: scaleFont(22) }]}>
              {hint ?? 'Sem dica disponível.'}
            </Text>
          )}

          <Pressable onPress={onClose} style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1 }]}>
            <Text style={styles.ctaText}>{loading ? 'Aguardar' : 'Entendi'}</Text>
          </Pressable>

          <Text style={styles.note}>Você pode pedir apenas uma dica por tentativa.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH.modal,
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: HomeTheme.glassBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: { color: HomeTheme.text, fontSize: 20, fontWeight: '900' },
  tag: {
    color: HomeTheme.textMuted,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  loadingText: { color: HomeTheme.textMuted, fontSize: 14 },
  hint: { color: HomeTheme.text, fontSize: 15, lineHeight: 22, marginBottom: 18 },
  cta: {
    backgroundColor: HomeTheme.link,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  ctaText: { color: '#0f172a', fontSize: 15, fontWeight: '900' },
  note: { color: HomeTheme.textMuted, fontSize: 11, textAlign: 'center', marginTop: 10 },
});
