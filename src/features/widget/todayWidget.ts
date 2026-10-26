import type { Widget } from 'expo-widgets';

import { isWidgetSupported } from '@/services/widgets';

import type { TodayWidgetProps } from './types';

/** app.json expo-widgets 플러그인의 widgets[].name과 같아야 한다 */
const WIDGET_NAME = 'TodayWidget';

let widget: Widget<TodayWidgetProps> | null = null;

/** 위젯 인스턴스 (지원하지 않는 환경이면 null) */
export function getTodayWidget(): Widget<TodayWidgetProps> | null {
  if (!isWidgetSupported) return null;
  if (!widget) {
    // Expo Go에서 깨지지 않도록 지원할 때만 불러온다
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createWidget } = require('expo-widgets') as typeof import('expo-widgets');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TodayWidgetLayout } = require('./layouts/TodayWidget') as typeof import('./layouts/TodayWidget');
    widget = createWidget<TodayWidgetProps>(
      WIDGET_NAME,
      TodayWidgetLayout as unknown as Parameters<typeof createWidget<TodayWidgetProps>>[1],
    );
  }
  return widget;
}
