import { EmptyState, Screen } from '@/shared/components/ui';

/** 알림 기본값, 주 시작 요일, 카테고리 관리. 다음 PR에서 구현. */
export function SettingsScreen() {
  return (
    <Screen title="설정">
      <EmptyState message="설정 준비 중" />
    </Screen>
  );
}
