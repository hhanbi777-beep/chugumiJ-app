package expo.modules.alarmclock

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

/** 알람 하나. weekdays(0 일요일 ~ 6 토요일)가 있으면 매주 반복, 없으면 fireAtMs에 한 번. */
data class AlarmSpec(
  val id: String,
  val title: String,
  val hour: Int,
  val minute: Int,
  val weekdays: List<Int>?,
  val fireAtMs: Long?
) {
  /** now 이후 가장 가까운 울릴 시각. 없으면 null (지난 한 번짜리 알람). */
  fun nextTriggerAt(now: Long = System.currentTimeMillis()): Long? {
    if (weekdays.isNullOrEmpty()) {
      return fireAtMs?.takeIf { it > now }
    }
    val candidate = Calendar.getInstance().apply {
      timeInMillis = now
      set(Calendar.HOUR_OF_DAY, hour)
      set(Calendar.MINUTE, minute)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }
    repeat(8) {
      val weekday = candidate.get(Calendar.DAY_OF_WEEK) - 1
      if (candidate.timeInMillis > now && weekday in weekdays) {
        return candidate.timeInMillis
      }
      candidate.add(Calendar.DAY_OF_YEAR, 1)
    }
    return null
  }

  fun toJson(): JSONObject = JSONObject().apply {
    put("id", id)
    put("title", title)
    put("hour", hour)
    put("minute", minute)
    weekdays?.let { put("weekdays", JSONArray(it)) }
    fireAtMs?.let { put("fireAtMs", it) }
  }

  companion object {
    fun fromJson(json: JSONObject) = AlarmSpec(
      id = json.getString("id"),
      title = json.getString("title"),
      hour = json.getInt("hour"),
      minute = json.getInt("minute"),
      weekdays = json.optJSONArray("weekdays")?.let { days -> List(days.length()) { days.getInt(it) } },
      fireAtMs = if (json.has("fireAtMs")) json.getLong("fireAtMs") else null
    )
  }
}

/** 재부팅 후에도 다시 예약할 수 있도록 알람 목록을 기기에 저장한다. */
object AlarmStore {
  private const val PREFS = "chugumi_alarm_clock"
  private const val KEY_SPECS = "specs"

  fun load(context: Context): List<AlarmSpec> {
    val raw = prefs(context).getString(KEY_SPECS, null) ?: return emptyList()
    return try {
      val array = JSONArray(raw)
      List(array.length()) { AlarmSpec.fromJson(array.getJSONObject(it)) }
    } catch (e: Exception) {
      emptyList()
    }
  }

  fun save(context: Context, specs: List<AlarmSpec>) {
    val array = JSONArray().apply { specs.forEach { put(it.toJson()) } }
    prefs(context).edit().putString(KEY_SPECS, array.toString()).apply()
  }

  fun find(context: Context, id: String): AlarmSpec? = load(context).firstOrNull { it.id == id }

  private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
