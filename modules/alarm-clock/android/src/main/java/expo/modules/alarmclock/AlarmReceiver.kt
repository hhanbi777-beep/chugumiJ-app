package expo.modules.alarmclock

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

/** 알람 시각이 되면 울리는 서비스를 시작하고, 매주 반복이면 다음 회차를 예약한다. */
class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != ACTION_FIRE) return
    val id = intent.getStringExtra(EXTRA_ID) ?: return
    val spec = AlarmStore.find(context, id)
    val title = spec?.title ?: intent.getStringExtra(EXTRA_TITLE) ?: return

    ContextCompat.startForegroundService(context, AlarmRingService.startIntent(context, id, title))
    spec?.let { AlarmScheduler.scheduleNext(context, it) }
  }

  companion object {
    const val ACTION_FIRE = "expo.modules.alarmclock.FIRE"
    const val EXTRA_ID = "id"
    const val EXTRA_TITLE = "title"
  }
}

/** 재부팅·앱 업데이트·시각/시간대 변경 후 알람을 다시 예약한다. */
class AlarmBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    when (intent.action) {
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED,
      Intent.ACTION_TIME_CHANGED,
      Intent.ACTION_TIMEZONE_CHANGED -> AlarmScheduler.rescheduleAll(context)
    }
  }
}
