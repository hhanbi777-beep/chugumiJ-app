import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AlarmRow, useAlarmActions, useAlarms } from '@/features/alarm';
import { EmptyState, HeaderButton, Screen } from '@/shared/components/ui';
import { radius, spacing, typography, useThemeColors } from '@/shared/theme';

/** 알람 목록. 알림 기본값, 주 시작 요일, 카테고리 관리는 다음 PR에서. */
export function SettingsScreen() {
  const colors = useThemeColors();
  const alarms = useAlarms();
  const { toggleEnabled } = useAlarmActions();

  return (
    <Screen title="설정">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.section, styles.sectionTitle, { color: colors.text }]}>
              알람 {alarms.length}
            </Text>
            <HeaderButton label="추가" isPrimary onPress={() => router.push('/alarm/new')} />
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {alarms.length === 0 ? (
              <EmptyState message="아직 알람이 없어요" />
            ) : (
              alarms.map((alarm) => (
                <AlarmRow
                  key={alarm.id}
                  alarm={alarm}
                  onToggle={toggleEnabled}
                  onPress={(a) => router.push(`/alarm/${a.id}`)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xxl, paddingBottom: spacing.xxl },
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { flex: 1 },
  card: { borderRadius: radius.md, overflow: 'hidden' },
});
