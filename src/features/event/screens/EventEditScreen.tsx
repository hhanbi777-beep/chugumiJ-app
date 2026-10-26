import { useLocalSearchParams } from 'expo-router';

import { EmptyState, Screen } from '@/shared/components/ui';

/** 일정 추가(id = 'new')·편집 시트. 다음 PR에서 폼 구현. */
export function EventEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen title={id === 'new' ? '새 일정' : '일정 편집'}>
      <EmptyState message="일정 입력 폼 준비 중" />
    </Screen>
  );
}
