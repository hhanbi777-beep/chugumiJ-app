import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing, typography, useThemeColors } from '@/shared/theme';
import { formatDateLabel, formatTimeLabel } from '@/shared/utils/date';

type DateTimeFieldProps = {
  value: Date;
  mode: 'date' | 'time';
  onChange: (value: Date) => void;
  accessibilityLabel: string;
};

/**
 * 날짜 또는 시간 선택.
 * iOS는 시스템 compact 피커를 그대로, Android는 버튼을 눌러 시스템 다이얼로그를 연다.
 */
export function DateTimeField({ value, mode, onChange, accessibilityLabel }: DateTimeFieldProps) {
  const colors = useThemeColors();

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display="compact"
        locale="ko-KR"
        minuteInterval={5}
        accessibilityLabel={accessibilityLabel}
        onValueChange={(_, date) => onChange(date)}
      />
    );
  }

  const open = () => {
    DateTimePickerAndroid.open({
      value,
      mode,
      is24Hour: true,
      onValueChange: (_, date) => onChange(date),
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={open}
      style={[styles.button, { backgroundColor: colors.background }]}>
      <Text style={[typography.caption, { color: colors.text }]}>
        {mode === 'date' ? formatDateLabel(value) : formatTimeLabel(value)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
});
