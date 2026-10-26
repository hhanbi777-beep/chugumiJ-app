import { HStack, Rectangle, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  cornerRadius,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import type { WidgetEnvironment } from 'expo-widgets';

import type { TodayWidgetProps } from '../types';

/**
 * iOS 오늘 위젯 (SwiftUI). 'widget' 지시어가 있는 함수는 문자열로 바뀌어 위젯 런타임에서 실행되므로
 * 바깥 변수·함수를 쓰지 않는다 (색상도 직접 적는다).
 */
export function TodayWidgetLayout(props: TodayWidgetProps, environment: WidgetEnvironment) {
  'widget';
  const isDark = environment.colorScheme === 'dark';
  const text = isDark ? '#F2F2F3' : '#1A1A1A';
  const subtle = isDark ? '#B0B4BA' : '#5F6368';
  const accent = isDark ? '#6E8EF5' : '#2F5BD9';
  const isSmall = environment.widgetFamily === 'systemSmall';
  const visible = props.items.slice(0, isSmall ? 3 : 4);
  const hidden = props.moreCount + props.items.length - visible.length;

  return (
    <VStack
      alignment="leading"
      spacing={6}
      modifiers={[
        frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' }),
        containerBackground(isDark ? '#1E1F22' : '#FFFFFF', 'widget'),
        widgetURL('chugumijapp:///'),
      ]}>
      <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(accent)]}>
        {props.dateLabel}
      </Text>
      {visible.length === 0 ? (
        <Text modifiers={[font({ size: 13 }), foregroundStyle(subtle)]}>오늘은 비어 있어요</Text>
      ) : (
        visible.map((item, index) => (
          <HStack key={`${index}`} spacing={6}>
            <Rectangle
              modifiers={[
                frame({ width: 3, height: 14 }),
                cornerRadius(1.5),
                foregroundStyle(item.kind === 'event' ? item.color : subtle),
              ]}
            />
            <Text modifiers={[font({ size: 13 }), foregroundStyle(text), lineLimit(1)]}>
              {item.kind === 'task' ? `○ ${item.title}` : item.title}
            </Text>
            <Spacer />
            {isSmall || item.time === '' ? null : (
              <Text modifiers={[font({ size: 11 }), foregroundStyle(subtle)]}>{item.time}</Text>
            )}
          </HStack>
        ))
      )}
      <Spacer />
      {hidden > 0 ? (
        <Text modifiers={[font({ size: 11 }), foregroundStyle(subtle)]}>{`외 ${hidden}개`}</Text>
      ) : null}
    </VStack>
  );
}
