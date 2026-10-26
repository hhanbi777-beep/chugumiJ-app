import { useCallback } from 'react';
import { Alert } from 'react-native';

/** "삭제할까요?" 확인 후 onConfirm 실행 */
export function useConfirmDelete(message: string, onConfirm: () => void) {
  return useCallback(() => {
    Alert.alert(message, undefined, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: onConfirm },
    ]);
  }, [message, onConfirm]);
}
