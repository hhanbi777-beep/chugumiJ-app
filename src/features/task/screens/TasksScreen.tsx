import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { EmptyState, HeaderButton, Screen } from '@/shared/components/ui';
import { MIN_TOUCH, radius, spacing, typography, useThemeColors } from '@/shared/theme';

import { TaskRow } from '../components/TaskRow';
import { useInboxTasks, useTaskActions } from '../hooks/useTasks';

export function TasksScreen() {
  const colors = useThemeColors();
  const { inboxId, tasks } = useInboxTasks();
  const { toggleCompleted, quickAdd } = useTaskActions();
  const [draft, setDraft] = useState('');

  const handleSubmit = () => {
    if (!inboxId) return;
    quickAdd(inboxId, draft);
    setDraft('');
  };

  return (
    <Screen
      title="할 일"
      headerRight={<HeaderButton label="추가" isPrimary onPress={() => router.push('/task/new')} />}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <FlatList
          data={tasks}
          keyExtractor={(task) => task.id}
          renderItem={({ item }) => (
            <TaskRow
              task={item}
              meta={item.dueDate ?? undefined}
              onToggle={toggleCompleted}
              onPress={(t) => router.push(`/task/${t.id}`)}
            />
          )}
          ListEmptyComponent={<EmptyState message="아직 할 일이 없어요" />}
        />
      </View>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={handleSubmit}
        placeholder="할 일 입력 후 엔터 (기본함에 저장)"
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel="빠른 할 일 추가"
        returnKeyType="done"
        style={[
          typography.body,
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.borderStrong, color: colors.text },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.md, overflow: 'hidden' },
  input: {
    minHeight: MIN_TOUCH + 4,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
