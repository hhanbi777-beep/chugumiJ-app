import { requireOptionalNativeModule } from 'expo';

/** 알람 하나. weekdays(0 일요일 ~ 6 토요일)가 있으면 매주 반복, 없으면 fireAtMs에 한 번. */
export type NativeAlarmSpec = {
  id: string;
  title: string;
  hour: number;
  minute: number;
  weekdays: number[] | null;
  fireAtMs: number | null;
};

export type AlarmAuthorization = 'authorized' | 'denied' | 'notDetermined' | 'unsupported';

type AlarmClockNativeModule = {
  isSupported(): boolean;
  requestAuthorization(): Promise<AlarmAuthorization>;
  replaceAll(specs: NativeAlarmSpec[]): Promise<void>;
};

// Expo Go·웹에는 이 네이티브 모듈이 없다 → null
const native = requireOptionalNativeModule<AlarmClockNativeModule>('AlarmClock');

/** 끌 때까지 울리는 진짜 알람을 쓸 수 있는지 (iOS 26+ 또는 Android 개발/스토어 빌드) */
export function isAlarmClockSupported(): boolean {
  return native?.isSupported() ?? false;
}

export async function requestAlarmAuthorization(): Promise<AlarmAuthorization> {
  return native ? native.requestAuthorization() : 'unsupported';
}

/** 넘어온 목록이 기기에 예약된 알람의 전부가 되도록 맞춘다 */
export async function replaceAlarms(specs: NativeAlarmSpec[]): Promise<void> {
  await native?.replaceAll(specs);
}
