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

import { useTaskForm } from '../hooks/useTaskForm';
import { Priority } from '../types';

const PRIORITY_OPTIONS = [
  { label: '없음', value: Priority.NONE },
  { label: '낮음', value: Priority.LOW },
  { label: '보통', value: Priority.MEDIUM },
  { label: '높음', value: Priority.HIGH },
] as const;

/** 할 일 추가(id = 'new')·편집 시트. 새 할 일은 ?date=YYYY-MM-DD로 기본 마감일을 받는다. */
export function TaskEditScreen() {
  const colors = useThemeColors();
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  const form = useTaskForm(id, date);
  const { values, setField } = form;

  const handleSave = () => {
    if (form.save()) router.back();
  };
  const handleDelete = useConfirmDelete('이 할 일을 삭제할까요?', () => {
    form.remove();
    router.back();
  });

  const header = (
    <Stack.Screen
      options={{
        title: form.isNew ? '새 할 일' : '할 일 편집',
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
        <EmptyState message="삭제되었거나 없는 할 일이에요" />
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
        placeholder="할 일 제목"
        value={values.title}
        onChangeText={(text) => setField('title', text)}
        autoFocus={form.isNew}
        returnKeyType="done"
      />

      <View style={styles.section}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>리스트</Text>
        <View style={styles.chips}>
          {form.lists.map((list) => (
            <Chip
              key={list.id}
              label={list.name}
              isSelected={values.listId === list.id}
              onPress={() => setField('listId', list.id)}
            />
          ))}
        </View>
      </View>

      <FieldGroup>
        <FieldRow label="마감일">
          {values.hasDueDate ? (
            <DateTimeField
              mode="date"
              value={values.dueDate}
              onChange={(d) => setField('dueDate', d)}
              accessibilityLabel="마감일"
            />
          ) : null}
          <Switch
            accessibilityLabel="마감일 사용"
            value={values.hasDueDate}
            onValueChange={(v) => setField('hasDueDate', v)}
            trackColor={{ true: colors.accent }}
          />
        </FieldRow>
        {values.hasDueDate ? (
          <FieldRow label="시간">
            {values.hasDueTime ? (
              <DateTimeField
                mode="time"
                value={values.dueTime}
                onChange={(d) => setField('dueTime', d)}
                accessibilityLabel="마감 시각"
              />
            ) : null}
            <Switch
              accessibilityLabel="마감 시각 사용"
              value={values.hasDueTime}
              onValueChange={(v) => setField('hasDueTime', v)}
              trackColor={{ true: colors.accent }}
            />
          </FieldRow>
        ) : null}
      </FieldGroup>

      {values.hasDueDate ? (
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            알림 {values.hasDueTime ? '' : '(시간이 없으면 오전 9시 기준)'}
          </Text>
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
      ) : null}

      <View style={styles.section}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>우선순위</Text>
        <View style={styles.chips}>
          {PRIORITY_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              isSelected={values.priority === option.value}
              onPress={() => setField('priority', option.value)}
            />
          ))}
        </View>
      </View>

      <TextField
        label="메모"
        placeholder="메모 (선택)"
        isMultiline
        value={values.note}
        onChangeText={(text) => setField('note', text)}
      />

      {form.isNew ? null : <DangerButton label="할 일 삭제" onPress={handleDelete} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl * 2 },
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
