import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Chip,
  DangerButton,
  DateTimeField,
  EmptyState,
  FieldGroup,
  FieldRow,
  HeaderButton,
  TextField,
} from '@/shared/components/ui';
import { useConfirmDelete } from '@/shared/hooks/useConfirmDelete';
import { spacing, typography, useThemeColors } from '@/shared/theme';

import { useAlarmForm } from '../hooks/useAlarmForm';
import { WEEKDAY_LABELS } from '../types';

/** 알람 추가(id = 'new')·편집 시트. ?date=YYYY-MM-DD로 들어오면 그날 한 번 울리는 알람이 기본. */
export function AlarmEditScreen() {
  const colors = useThemeColors();
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  const form = useAlarmForm(id, date);
  const { values, setField } = form;

  const handleSave = () => {
    if (form.save()) router.back();
  };
  const handleDelete = useConfirmDelete('이 알람을 삭제할까요?', () => {
    form.remove();
    router.back();
  });

  const header = (
    <Stack.Screen
      options={{
        title: form.isNew ? '새 알람' : '알람 편집',
        headerLeft: () => <HeaderButton label="취소" onPress={() => router.back()} />,
        headerRight: () => (
          <HeaderButton label="저장" isPrimary isDisabled={!form.canSave} onPress={handleSave} />
        ),
      }}
    />
  );

  if (form.isMissing) {
    return (
      <>
        {header}
        <EmptyState message="삭제되었거나 없는 알람이에요" />
      </>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      {header}
      <FieldGroup>
        <FieldRow label="시각">
          <DateTimeField
            mode="time"
            value={values.time}
            onChange={(d) => setField('time', d)}
            accessibilityLabel="알람 시각"
          />
        </FieldRow>
      </FieldGroup>

      <View style={styles.section}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>반복</Text>
        <View style={styles.chips}>
          <Chip
            label="매주 요일 반복"
            isSelected={values.repeatKind === 'weekly'}
            onPress={() => setField('repeatKind', 'weekly')}
          />
          <Chip
            label="특정 날짜"
            isSelected={values.repeatKind === 'once'}
            onPress={() => setField('repeatKind', 'once')}
          />
        </View>
      </View>

      {values.repeatKind === 'weekly' ? (
        <View style={styles.section}>
          <View style={styles.chips}>
            {WEEKDAY_LABELS.map((label, weekday) => (
              <Chip
                key={label}
                label={label}
                isSelected={values.weekdays.includes(weekday)}
                onPress={() => form.toggleWeekday(weekday)}
              />
            ))}
          </View>
          {form.canSave ? null : (
            <Text style={[typography.caption, { color: colors.danger }]}>요일을 하나 이상 골라 주세요</Text>
          )}
        </View>
      ) : (
        <FieldGroup>
          <FieldRow label="날짜">
            <DateTimeField
              mode="date"
              value={values.date}
              onChange={(d) => setField('date', d)}
              accessibilityLabel="알람 날짜"
            />
          </FieldRow>
        </FieldGroup>
      )}

      <TextField
        label="이름"
        placeholder="알람 (선택)"
        value={values.label}
        onChangeText={(text) => setField('label', text)}
        returnKeyType="done"
      />

      {form.isNew ? null : <DangerButton label="알람 삭제" onPress={handleDelete} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl * 2 },
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
