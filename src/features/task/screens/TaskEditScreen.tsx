import { useLocalSearchParams } from 'expo-router';

import { EmptyState, Screen } from '@/shared/components/ui';

/** 할 일 추가(id = 'new')·편집 시트. 다음 PR에서 폼 구현. */
export function TaskEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen title={id === 'new' ? '새 할 일' : '할 일 편집'}>
      <EmptyState message="할 일 입력 폼 준비 중" />
    </Screen>
  );
}
