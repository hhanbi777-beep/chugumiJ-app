package expo.modules.alarmclock

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import java.lang.ref.WeakReference
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** 잠금 화면 위에 뜨는 알람 화면: 현재 시각, 알람 이름, 다시 알림 / 끄기. */
class AlarmRingActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    showOverLockScreen()
    AlarmRingService.activeActivity = WeakReference(this)
    setContentView(buildLayout(intent.getStringExtra(EXTRA_TITLE) ?: "알람"))
  }

  override fun onDestroy() {
    if (AlarmRingService.activeActivity?.get() === this) {
      AlarmRingService.activeActivity = null
    }
    super.onDestroy()
  }

  @Deprecated("뒤로 가기로는 알람을 끄지 않는다")
  override fun onBackPressed() {
    // 버튼으로만 끈다
  }

  private fun showOverLockScreen() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
      )
    }
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }

  private fun send(action: String) {
    startService(AlarmRingService.actionIntent(this, action))
    finish()
  }

  private fun buildLayout(title: String): LinearLayout {
    val accent = Color.parseColor("#2F5BD9")
    return LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setBackgroundColor(Color.parseColor("#121214"))
      setPadding(dp(32), dp(32), dp(32), dp(48))

      addView(TextView(context).apply {
        text = SimpleDateFormat("HH:mm", Locale.KOREA).format(Date())
        setTextColor(Color.WHITE)
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 72f)
        typeface = Typeface.create("sans-serif-light", Typeface.NORMAL)
        gravity = Gravity.CENTER
      })
      addView(TextView(context).apply {
        text = title
        setTextColor(Color.parseColor("#B0B4BA"))
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
        gravity = Gravity.CENTER
        setPadding(0, dp(8), 0, dp(64))
      })
      addView(button("다시 알림 (5분)", Color.parseColor("#2A2B2F")) { send(AlarmRingService.ACTION_SNOOZE) })
      addView(button("끄기", accent) { send(AlarmRingService.ACTION_DISMISS) })
    }
  }

  private fun button(label: String, background: Int, onClick: () -> Unit) = Button(this).apply {
    text = label
    isAllCaps = false
    setTextColor(Color.WHITE)
    setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
    setBackgroundColor(background)
    minHeight = dp(56)
    setOnClickListener { onClick() }
    layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(56)).apply {
      topMargin = dp(12)
    }
  }

  private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

  companion object {
    private const val EXTRA_TITLE = "title"

    fun intent(context: Context, title: String) =
      Intent(context, AlarmRingActivity::class.java).apply {
        putExtra(EXTRA_TITLE, title)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_USER_ACTION)
      }
  }
}
