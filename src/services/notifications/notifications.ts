import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

/** expo-notifications 래퍼. 앱 코드는 이 파일만 거친다. */

const CHANNEL_ID = 'reminders';

export type LocalNotification = {
  fireAt: Date;
  title: string;
  body: string;
  /** 알림을 누르면 열 경로 */
  url: string;
};

/** 앱 시작 시 1회: 앱이 켜져 있을 때도 배너 표시, Android 채널 생성 */
export async function setupNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '일정·할 일 알림',
      importance: AndroidImportance.HIGH,
    });
  }
}

/** 권한이 없으면 한 번 묻는다. 허용 여부를 돌려준다. */
export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

let queue: Promise<void> = Promise.resolve();

/** 예약된 알림을 모두 지우고 목록대로 다시 예약한다. 호출이 겹치면 순서대로 실행. */
export function replaceScheduled(items: LocalNotification[]): Promise<void> {
  queue = queue
    .then(async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (items.length === 0 || !(await ensurePermission())) return;
      for (const item of items) {
        await Notifications.scheduleNotificationAsync({
          content: { title: item.title, body: item.body, data: { url: item.url } },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: item.fireAt,
            channelId: CHANNEL_ID,
          },
        });
      }
    })
    .catch((error: unknown) => {
      console.warn('알림 예약 실패', error);
    });
  return queue;
}

/** 마지막으로 누른 알림 (앱이 꺼져 있다가 열린 경우 포함). id로 같은 알림을 두 번 처리하지 않게 한다. */
export function useOpenedNotification(): { id: string; url: string } | null {
  const response = Notifications.useLastNotificationResponse();
  if (!response) return null;
  const url = response.notification.request.content.data?.url;
  return typeof url === 'string' ? { id: response.notification.request.identifier, url } : null;
}
