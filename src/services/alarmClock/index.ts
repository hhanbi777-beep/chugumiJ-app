// 진짜 알람 네이티브 모듈 (modules/alarm-clock). 앱 코드는 이 파일로만 접근한다.
export {
  isAlarmClockSupported,
  replaceAlarms,
  requestAlarmAuthorization,
  type AlarmAuthorization,
  type NativeAlarmSpec,
} from '../../../modules/alarm-clock';
