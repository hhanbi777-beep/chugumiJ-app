#if canImport(AlarmKit)
import AlarmKit
import Foundation
import SwiftUI

@available(iOS 26.0, *)
struct ChugumiAlarmMetadata: AlarmMetadata {}

@available(iOS 26.0, *)
enum AlarmKitScheduler {
  /// 다시 알림 간격
  private static let snoozeSeconds: TimeInterval = 5 * 60
  /// 예약한 알람의 내용 (id → 서명). 바뀐 알람만 다시 예약하는 데 쓴다.
  private static let signaturesKey = "AlarmClock.signatures"
  private static let tint = Color(red: 0x2F / 255, green: 0x5B / 255, blue: 0xD9 / 255)

  static func requestAuthorization() async -> String {
    let manager = AlarmManager.shared
    if manager.authorizationState == .authorized {
      return "authorized"
    }
    do {
      switch try await manager.requestAuthorization() {
      case .authorized: return "authorized"
      case .denied: return "denied"
      default: return "notDetermined"
      }
    } catch {
      return "denied"
    }
  }

  static func replaceAll(_ specs: [AlarmSpecRecord]) async throws {
    let manager = AlarmManager.shared
    guard manager.authorizationState == .authorized else { return }

    let scheduledIds = Set(((try? manager.alarms) ?? []).map(\.id))
    var signatures = UserDefaults.standard.dictionary(forKey: signaturesKey) as? [String: String] ?? [:]
    var wantedIds = Set<UUID>()

    for spec in specs {
      guard let id = UUID(uuidString: spec.id) else { continue }
      wantedIds.insert(id)
      let signature = signatureOf(spec)
      if scheduledIds.contains(id) && signatures[spec.id] == signature {
        continue
      }
      if scheduledIds.contains(id) {
        try? manager.cancel(id: id)
      }
      try await schedule(spec, id: id)
      signatures[spec.id] = signature
    }

    for id in scheduledIds.subtracting(wantedIds) {
      try? manager.cancel(id: id)
    }
    signatures = signatures.filter { key, _ in UUID(uuidString: key).map(wantedIds.contains) ?? false }
    UserDefaults.standard.set(signatures, forKey: signaturesKey)
  }

  private static func signatureOf(_ spec: AlarmSpecRecord) -> String {
    let days = (spec.weekdays ?? []).sorted().map(String.init).joined(separator: ",")
    return "\(spec.title)|\(spec.hour):\(spec.minute)|\(days)|\(spec.fireAtMs ?? 0)"
  }

  private static func scheduleOf(_ spec: AlarmSpecRecord) -> Alarm.Schedule? {
    if let weekdays = spec.weekdays, !weekdays.isEmpty {
      let days: [Locale.Weekday] = weekdays.compactMap { day in
        switch day {
        case 0: return .sunday
        case 1: return .monday
        case 2: return .tuesday
        case 3: return .wednesday
        case 4: return .thursday
        case 5: return .friday
        case 6: return .saturday
        default: return nil
        }
      }
      let time = Alarm.Schedule.Relative.Time(hour: spec.hour, minute: spec.minute)
      return .relative(Alarm.Schedule.Relative(time: time, repeats: .weekly(days)))
    }
    if let fireAtMs = spec.fireAtMs {
      return .fixed(Date(timeIntervalSince1970: fireAtMs / 1000))
    }
    return nil
  }

  private static func schedule(_ spec: AlarmSpecRecord, id: UUID) async throws {
    guard let schedule = scheduleOf(spec) else { return }

    let alert = AlarmPresentation.Alert(
      title: LocalizedStringResource(stringLiteral: spec.title),
      stopButton: AlarmButton(text: "끄기", textColor: .white, systemImageName: "stop.circle"),
      secondaryButton: AlarmButton(text: "다시 알림", textColor: .white, systemImageName: "zzz"),
      secondaryButtonBehavior: .countdown
    )
    let attributes = AlarmAttributes<ChugumiAlarmMetadata>(
      presentation: AlarmPresentation(alert: alert),
      metadata: ChugumiAlarmMetadata(),
      tintColor: tint
    )
    let configuration = AlarmManager.AlarmConfiguration<ChugumiAlarmMetadata>(
      countdownDuration: Alarm.CountdownDuration(preAlert: nil, postAlert: snoozeSeconds),
      schedule: schedule,
      attributes: attributes,
      sound: .default
    )
    _ = try await AlarmManager.shared.schedule(id: id, configuration: configuration)
  }
}
#endif
