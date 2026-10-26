import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

/** + 버튼: 일정/할 일 중 고르게 한 뒤 해당 날짜로 추가 시트를 연다. */
export function useAddPrompt() {
  return useCallback((dateKey: string) => {
    Alert.alert('무엇을 추가할까요?', undefined, [
      { text: '일정', onPress: () => router.push(`/event/new?date=${dateKey}`) },
      { text: '할 일', onPress: () => router.push(`/task/new?date=${dateKey}`) },
      { text: '취소', style: 'cancel' },
    ]);
  }, []);
}
