import { Alert, Platform } from 'react-native';

import { isAlarmClockSupported, requestAlarmAuthorization } from '@/services/alarmClock';
import { ensureNotificationPermission } from '@/services/notifications';

/**
 * 알람 저장 전에 권한을 확인한다. 거부돼도 저장은 하고, 왜 안 울릴 수 있는지 알려준다.
 * - iOS 26+: AlarmKit 권한
 * - Android: 알림 권한 → 정확한 알람·전체 화면 권한 (없으면 설정 화면을 연다)
 * - 그 외: 알림 권한 (일반 알림으로 대신 울림)
 */
export async function ensureAlarmPermission(): Promise<void> {
  const isNative = isAlarmClockSupported();
  const needsNotification = !isNative || Platform.OS === 'android';
  if (needsNotification && !(await ensureNotificationPermission())) {
    Alert.alert('알림이 꺼져 있어요', '설정에서 알림을 허용해야 알람이 울려요.');
    return;
  }
  if (!isNative) return;
  const status = await requestAlarmAuthorization();
  if (status === 'denied') {
    Alert.alert(
      '알람 권한이 필요해요',
      Platform.OS === 'ios'
        ? '설정 > 추구미 J에서 알람을 허용해 주세요.'
        : '열린 설정 화면에서 허용한 뒤 알람을 다시 저장해 주세요.',
    );
  }
}
