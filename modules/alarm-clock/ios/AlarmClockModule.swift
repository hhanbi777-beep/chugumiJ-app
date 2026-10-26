import ExpoModulesCore

/// JS에서 넘어오는 알람 하나. weekdays(0 일요일 ~ 6 토요일)가 있으면 매주 반복, 없으면 fireAtMs에 한 번.
struct AlarmSpecRecord: Record {
  @Field var id: String = ""
  @Field var title: String = ""
  @Field var hour: Int = 0
  @Field var minute: Int = 0
  @Field var weekdays: [Int]? = nil
  @Field var fireAtMs: Double? = nil
}

public class AlarmClockModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AlarmClock")

    /// AlarmKit은 iOS 26부터. 그 아래는 JS가 로컬 알림으로 대신 울린다.
    Function("isSupported") { () -> Bool in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) {
        return true
      }
      #endif
      return false
    }

    AsyncFunction("requestAuthorization") { () async -> String in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) {
        return await AlarmKitScheduler.requestAuthorization()
      }
      #endif
      return "unsupported"
    }

    /// 넘어온 목록이 전부가 되도록 맞춘다. 바뀌지 않은 알람은 건드리지 않는다 (다시 알림 중인 알람 유지).
    AsyncFunction("replaceAll") { (specs: [AlarmSpecRecord]) async throws in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) {
        try await AlarmKitScheduler.replaceAll(specs)
      }
      #endif
    }
  }
}
