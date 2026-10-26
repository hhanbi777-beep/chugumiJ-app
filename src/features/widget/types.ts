/** 위젯 한 줄: 일정(시간 + 카테고리 색) 또는 할 일 */
export type TodayWidgetItem = {
  kind: 'event' | 'task';
  /** '10:00', '종일', '' */
  time: string;
  title: string;
  /** '#RRGGBB' */
  color: string;
};

/**
 * 오늘 위젯에 넘기는 값. 위젯은 별도 JS 런타임에서 그려서 DB를 못 읽으므로
 * 앱이 계산한 요약만 넘긴다.
 */
export type TodayWidgetProps = {
  /** 예: '10월 26일 월요일' */
  dateLabel: string;
  /** 일정 먼저, 그다음 미완료 할 일 (최대 6개) */
  items: TodayWidgetItem[];
  /** items 밖에 더 있는 개수 */
  moreCount: number;
};
