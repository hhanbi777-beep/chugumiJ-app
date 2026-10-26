package expo.modules.alarmclock

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build

/** AlarmManager.setAlarmClock으로 예약 (상태바 알람 아이콘, 도즈 모드에서도 정확히 울림). */
object AlarmScheduler {
  /** 다시 알림 간격 */
  const val SNOOZE_MS = 5 * 60 * 1000L

  fun replaceAll(context: Context, specs: List<AlarmSpec>) {
    val newIds = specs.map { it.id }.toSet()
    AlarmStore.load(context).filter { it.id !in newIds }.forEach { cancel(context, it.id) }
    AlarmStore.save(context, specs)
    specs.forEach { scheduleNext(context, it) }
  }

  /** 저장된 알람 전부 다시 예약 (재부팅, 시간대 변경) */
  fun rescheduleAll(context: Context) {
    AlarmStore.load(context).forEach { scheduleNext(context, it) }
  }

  fun scheduleNext(context: Context, spec: AlarmSpec) {
    val triggerAt = spec.nextTriggerAt()
    if (triggerAt == null) {
      alarmManager(context).cancel(firePendingIntent(context, spec.id, spec.title, isSnooze = false))
      return
    }
    setAlarm(context, triggerAt, firePendingIntent(context, spec.id, spec.title, isSnooze = false))
  }

  fun snooze(context: Context, id: String, title: String) {
    val triggerAt = System.currentTimeMillis() + SNOOZE_MS
    setAlarm(context, triggerAt, firePendingIntent(context, id, title, isSnooze = true))
  }

  fun cancel(context: Context, id: String) {
    val manager = alarmManager(context)
    manager.cancel(firePendingIntent(context, id, "", isSnooze = false))
    manager.cancel(firePendingIntent(context, id, "", isSnooze = true))
  }

  fun canScheduleExact(context: Context): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager(context).canScheduleExactAlarms()

  private fun setAlarm(context: Context, triggerAt: Long, operation: PendingIntent) {
    val manager = alarmManager(context)
    try {
      if (canScheduleExact(context)) {
        manager.setAlarmClock(AlarmManager.AlarmClockInfo(triggerAt, showAppPendingIntent(context)), operation)
      } else {
        manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, operation)
      }
    } catch (e: SecurityException) {
      manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, operation)
    }
  }

  private fun firePendingIntent(context: Context, id: String, title: String, isSnooze: Boolean): PendingIntent {
    val intent = Intent(context, AlarmReceiver::class.java).apply {
      action = AlarmReceiver.ACTION_FIRE
      // data로 알람마다 다른 PendingIntent가 되게 한다
      data = Uri.parse("chugumi-alarm://${if (isSnooze) "snooze" else "alarm"}/$id")
      putExtra(AlarmReceiver.EXTRA_ID, id)
      putExtra(AlarmReceiver.EXTRA_TITLE, title)
    }
    return PendingIntent.getBroadcast(
      context,
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun showAppPendingIntent(context: Context): PendingIntent? {
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null
    return PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  }

  private fun alarmManager(context: Context) = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
}
