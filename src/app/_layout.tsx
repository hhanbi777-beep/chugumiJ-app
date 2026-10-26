import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, useColorScheme, View } from 'react-native';

import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';
import { ensureDefaults } from '@/db/seed';

SplashScreen.preventAutoHideAsync();

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
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ presentation: 'formSheet', title: '일정' }} />
        <Stack.Screen name="task/[id]" options={{ presentation: 'formSheet', title: '할 일' }} />
      </Stack>
    </ThemeProvider>
  );
}
