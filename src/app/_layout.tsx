import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, DefaultTheme, type Href, router, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Text, useColorScheme, View } from 'react-native';

import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';
import { ensureDefaults } from '@/db/seed';
import { useAlarmScheduling } from '@/features/alarm';
import { useReminderNotifications } from '@/features/reminder';
import { useTodayWidgetSync } from '@/features/widget';
import { replaceScheduled, setupNotifications, useOpenedNotification } from '@/services/notifications';

/** iOS는 앱당 예약 알림 64개 제한. 여유를 두고 알람 먼저, 그다음 가까운 알림 순으로 자른다. */
const MAX_SCHEDULED = 60;

SplashScreen.preventAutoHideAsync();
void setupNotifications();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success) {
      ensureDefaults();
      SplashScreen.hideAsync();
    }
  }, [success]);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>데이터를 불러오지 못했어요: {error.message}</Text>
      </View>
    );
  }
  if (!success) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppEffects />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ presentation: 'formSheet', title: '일정' }} />
        <Stack.Screen name="task/[id]" options={{ presentation: 'formSheet', title: '할 일' }} />
        <Stack.Screen name="alarm/[id]" options={{ presentation: 'formSheet', title: '알람' }} />
      </Stack>
    </ThemeProvider>
  );
}

/** 앱이 다시 앞으로 올 때마다 바뀌는 현재 시각 (지난 알림 걸러내기용) */
function useForegroundNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });
    return () => sub.remove();
  }, []);
  return now;
}

/** DB 준비 후 도는 앱 전역 작업: 알람·알림을 기기에 예약, 알림 누르면 해당 화면 열기 */
function AppEffects() {
  const now = useForegroundNow();
  const alarmItems = useAlarmScheduling(now);
  const reminderItems = useReminderNotifications(now);
  useTodayWidgetSync(now);
  const scheduled = useMemo(
    () => [...alarmItems, ...reminderItems].slice(0, MAX_SCHEDULED),
    [alarmItems, reminderItems],
  );

  // 일정·할 일·알람이 바뀌거나 앱이 다시 앞으로 오면 전체를 다시 예약
  useEffect(() => {
    void replaceScheduled(scheduled);
  }, [scheduled]);

  const opened = useOpenedNotification();
  const handledId = useRef<string | null>(null);

  useEffect(() => {
    if (!opened || handledId.current === opened.id) return;
    handledId.current = opened.id;
    router.push(opened.url as Href);
  }, [opened]);

  return null;
}
