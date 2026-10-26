import { requireOptionalNativeModule } from 'expo';

/**
 * 홈 화면 위젯 네이티브 모듈이 있는지 (Expo Go·웹에는 없다).
 * expo-widgets는 import만 해도 네이티브 모듈을 찾으므로, 이 값이 true일 때만 불러온다.
 */
export const isWidgetSupported = requireOptionalNativeModule('ExpoWidgets') !== null;
