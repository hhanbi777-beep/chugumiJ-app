import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useThemeColors } from '@/shared/theme';
import { formatTime } from '@/shared/utils/date';

import type { Event } from '../types';

type EventCardProps = {
  event: Event;
  color: string;
};

export function EventCard({ event, color }: EventCardProps) {
  const colors = useThemeColors();
  const timeLabel =
    event.isAllDay || !event.startAt || !event.endAt
      ? '종일'
      : `${formatTime(event.startAt)} – ${formatTime(event.endAt)}`;
  const meta = event.location ? `${timeLabel} · ${event.location}` : timeLabel;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={styles.text}>
        <Text style={[typography.body, styles.title, { color: colors.text }]} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{meta}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  bar: { width: 4, borderRadius: 2 },
  text: { flex: 1, gap: 2 },
  title: { fontWeight: '500' },
});
