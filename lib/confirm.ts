import { Alert, Platform } from 'react-native';

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

/**
 * Diálogo de confirmação que funciona em iOS, Android e Web.
 * `Alert.alert` não é confiável na web — usamos `window.confirm` nesse caso.
 */
export function confirmAction({
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancelar',
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}
