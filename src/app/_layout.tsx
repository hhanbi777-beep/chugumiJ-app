import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, DefaultTheme, type Href, router, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Text, useColorScheme, View } from 'react-native';

import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';
import { ensureDefaults } from '@/db/seed';
import { useReminderScheduling } from '@/features/reminder';
import { setupNotifications, useOpenedNotification } from '@/services/notifications';

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
      </Stack>
    </ThemeProvider>
  );
}

/** DB 준비 후 도는 앱 전역 작업: 알림 예약 동기화, 알림 누르면 해당 화면 열기 */
function AppEffects() {
  useReminderScheduling();
  const opened = useOpenedNotification();
  const handledId = useRef<string | null>(null);

  useEffect(() => {
    if (!opened || handledId.current === opened.id) return;
    handledId.current = opened.id;
    router.push(opened.url as Href);
  }, [opened]);

  return null;
}
