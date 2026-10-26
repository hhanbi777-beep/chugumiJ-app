package expo.modules.alarmclock

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

/** JS에서 넘어오는 알람 하나 */
class AlarmSpecRecord : Record {
  @Field val id: String = ""
  @Field val title: String = ""
  @Field val hour: Int = 0
  @Field val minute: Int = 0
  @Field val weekdays: List<Int>? = null
  @Field val fireAtMs: Double? = null

  fun toSpec() = AlarmSpec(id, title, hour, minute, weekdays, fireAtMs?.toLong())
}

class AlarmClockModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("AlarmClock")

    Function("isSupported") { true }

    /**
     * 알람에 필요한 권한을 확인하고, 없으면 해당 설정 화면을 연다.
     * 알림(POST_NOTIFICATIONS)은 JS에서 expo-notifications로 먼저 요청한다.
     */
    AsyncFunction("requestAuthorization") {
      if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
        return@AsyncFunction "denied"
      }
      if (!AlarmScheduler.canScheduleExact(context) && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        openSettings(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
        return@AsyncFunction "denied"
      }
      if (Build.VERSION.SDK_INT >= 34) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (!manager.canUseFullScreenIntent()) {
          openSettings(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT)
          return@AsyncFunction "denied"
        }
      }
      "authorized"
    }

    /** 넘어온 목록이 전부가 되도록 예약을 맞춘다 */
    AsyncFunction("replaceAll") { specs: List<AlarmSpecRecord> ->
      AlarmScheduler.replaceAll(context, specs.map { it.toSpec() })
    }
  }

  private fun openSettings(action: String) {
    val intent = Intent(action, Uri.parse("package:${context.packageName}")).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    try {
      context.startActivity(intent)
    } catch (e: Exception) {
      // 설정 화면이 없는 기기
    }
  }
}
