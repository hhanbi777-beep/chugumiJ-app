import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { MIN_TOUCH, spacing, typography, useThemeColors } from '@/shared/theme';

import type { Alarm } from '../types';
import { formatRepeat, repeatOf } from '../utils/alarmRepeat';

type AlarmRowProps = {
  alarm: Alarm;
  onToggle: (alarm: Alarm) => void;
  onPress: (alarm: Alarm) => void;
};

export function AlarmRow({ alarm, onToggle, onPress }: AlarmRowProps) {
  const colors = useThemeColors();
  const textColor = alarm.isEnabled ? colors.text : colors.textDisabled;
  const repeatLabel = formatRepeat(repeatOf(alarm));

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`알람 ${alarm.time}, ${repeatLabel}`}
        onPress={() => onPress(alarm)}
        style={styles.body}>
        <Text style={[styles.time, { color: textColor }]}>{alarm.time}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
          {alarm.label ? `${alarm.label} · ${repeatLabel}` : repeatLabel}
        </Text>
      </Pressable>
      <Switch
        accessibilityLabel={`알람 ${alarm.time} 켜기`}
        value={alarm.isEnabled}
        onValueChange={() => onToggle(alarm)}
        trackColor={{ true: colors.accent }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH + 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: { flex: 1, paddingVertical: spacing.sm, gap: 2 },
  time: { fontSize: 28, fontWeight: '300', fontVariant: ['tabular-nums'] },
});
