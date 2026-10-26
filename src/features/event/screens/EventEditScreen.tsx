import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { REMINDER_OPTIONS } from '@/features/reminder';
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

import { useEventForm } from '../hooks/useEventForm';

/** 일정 추가(id = 'new')·편집 시트. 새 일정은 ?date=YYYY-MM-DD로 기본 날짜를 받는다. */
export function EventEditScreen() {
  const colors = useThemeColors();
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  const form = useEventForm(id, date);
  const { values, setField } = form;

  const handleSave = () => {
    if (form.save()) router.back();
  };
  const handleDelete = useConfirmDelete('이 일정을 삭제할까요?', () => {
    form.remove();
    router.back();
  });

  const header = (
    <Stack.Screen
      options={{
        title: form.isNew ? '새 일정' : '일정 편집',
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
        <EmptyState message="삭제되었거나 없는 일정이에요" />
      </>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      {header}
      <TextField
        label="제목"
        placeholder="일정 제목"
        value={values.title}
        onChangeText={(text) => setField('title', text)}
        autoFocus={form.isNew}
        returnKeyType="done"
      />

      <FieldGroup>
        <FieldRow label="종일">
          <Switch
            accessibilityLabel="종일"
            value={values.isAllDay}
            onValueChange={(isAllDay) => setField('isAllDay', isAllDay)}
            trackColor={{ true: colors.accent }}
          />
        </FieldRow>
        <FieldRow label="시작">
          <DateTimeField
            mode="date"
            value={values.start}
            onChange={(d) => setField('start', d)}
            accessibilityLabel="시작 날짜"
          />
          {values.isAllDay ? null : (
            <DateTimeField
              mode="time"
              value={values.start}
              onChange={(d) => setField('start', d)}
              accessibilityLabel="시작 시각"
            />
          )}
        </FieldRow>
        <FieldRow label="종료">
          <DateTimeField
            mode="date"
            value={values.end}
            onChange={(d) => setField('end', d)}
            accessibilityLabel="종료 날짜"
          />
          {values.isAllDay ? null : (
            <DateTimeField
              mode="time"
              value={values.end}
              onChange={(d) => setField('end', d)}
              accessibilityLabel="종료 시각"
            />
          )}
        </FieldRow>
      </FieldGroup>
      {form.isEndValid ? null : (
        <Text style={[typography.caption, { color: colors.danger }]}>종료가 시작보다 빨라요</Text>
      )}

      <View style={styles.section}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>카테고리</Text>
        <View style={styles.chips}>
          {form.categories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              dotColor={category.color}
              isSelected={values.calendarId === category.id}
              onPress={() => setField('calendarId', category.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>알림</Text>
        <View style={styles.chips}>
          {REMINDER_OPTIONS.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              isSelected={values.reminderOffset === option.offsetMinutes}
              onPress={() => setField('reminderOffset', option.offsetMinutes)}
            />
          ))}
        </View>
      </View>

      <TextField
        label="장소"
        placeholder="장소 (선택)"
        value={values.location}
        onChangeText={(text) => setField('location', text)}
      />
      <TextField
        label="메모"
        placeholder="메모 (선택)"
        isMultiline
        value={values.note}
        onChangeText={(text) => setField('note', text)}
      />

      {form.isNew ? null : <DangerButton label="일정 삭제" onPress={handleDelete} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl * 2 },
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
