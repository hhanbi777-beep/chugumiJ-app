import { Box, Column, Row, Spacer, Text } from '@expo/ui/jetpack-compose';
import {
  background,
  cornerRadius,
  fillMaxSize,
  fillMaxWidth,
  paddingAll,
  size,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import type { WidgetEnvironment } from 'expo-widgets';

import type { TodayWidgetProps } from '../types';

/**
 * Android 오늘 위젯 (Glance). 'widget' 지시어가 있는 함수는 문자열로 바뀌어 위젯 런타임에서 실행되므로
 * 바깥 변수·함수를 쓰지 않는다 (색상도 직접 적는다). 위젯을 누르면 앱이 열린다.
 */
export function TodayWidgetLayout(props: TodayWidgetProps, environment: WidgetEnvironment) {
  'widget';
  const isDark = environment.colorScheme === 'dark';
  const text = isDark ? '#F2F2F3' : '#1A1A1A';
  const subtle = isDark ? '#B0B4BA' : '#5F6368';
  const accent = isDark ? '#6E8EF5' : '#2F5BD9';
  const visible = props.items.slice(0, 4);
  const hidden = props.moreCount + props.items.length - visible.length;

  return (
    <Column
      verticalArrangement={{ spacedBy: 6 }}
      modifiers={[
        fillMaxSize(),
        cornerRadius(16),
        background(isDark ? '#1E1F22' : '#FFFFFF'),
        paddingAll(14),
      ]}>
      <Text color={accent} style={{ fontSize: 13, fontWeight: '600' }}>
        {props.dateLabel}
      </Text>
      {visible.length === 0 ? (
        <Text color={subtle} style={{ fontSize: 13 }}>
          오늘은 비어 있어요
        </Text>
      ) : (
        visible.map((item, index) => (
          <Row key={`${index}`} verticalAlignment="center" modifiers={[fillMaxWidth()]}>
            <Box
              modifiers={[
                size(3, 14),
                cornerRadius(2),
                background(item.kind === 'event' ? item.color : subtle),
              ]}
            />
            <Spacer modifiers={[size(6, 1)]} />
            <Text color={text} maxLines={1} style={{ fontSize: 13 }} modifiers={[weight(1)]}>
              {item.kind === 'task' ? `○ ${item.title}` : item.title}
            </Text>
            {item.time === '' ? null : (
              <Text color={subtle} style={{ fontSize: 11 }}>
                {item.time}
              </Text>
            )}
          </Row>
        ))
      )}
      {hidden > 0 ? (
        <Text color={subtle} style={{ fontSize: 11 }}>
          {`외 ${hidden}개`}
        </Text>
      ) : null}
    </Column>
  );
}
