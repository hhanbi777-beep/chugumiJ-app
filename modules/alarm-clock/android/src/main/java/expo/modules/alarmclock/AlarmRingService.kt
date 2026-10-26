package expo.modules.alarmclock

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import java.lang.ref.WeakReference

/** 알람이 울리는 동안 도는 포그라운드 서비스: 소리 반복, 진동, 전체 화면 알람 화면. */
class AlarmRingService : Service() {
  private var player: MediaPlayer? = null
  private var vibrator: Vibrator? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private val handler = Handler(Looper.getMainLooper())
  private val autoStop = Runnable { stopRinging() }
  private var currentId: String? = null
  private var currentTitle: String = ""

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_START -> {
        val id = intent.getStringExtra(EXTRA_ID) ?: return START_NOT_STICKY
        val title = intent.getStringExtra(EXTRA_TITLE) ?: "알람"
        startRinging(id, title)
      }
      ACTION_DISMISS -> stopRinging()
      ACTION_SNOOZE -> {
        currentId?.let { AlarmScheduler.snooze(this, it, currentTitle) }
        stopRinging()
      }
      else -> stopSelf()
    }
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    releasePlayback()
    super.onDestroy()
  }

  private fun startRinging(id: String, title: String) {
    // 이미 울리는 중이면 새 알람으로 바꾼다
    releasePlayback()
    currentId = id
    currentTitle = title

    ensureChannel(this)
    val notification = buildNotification(title)
    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
    } else {
      0
    }
    ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, type)

    val power = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "chugumi:alarm").apply {
      acquire(MAX_RING_MS + 5_000)
    }
    startSound()
    startVibration()
    handler.postDelayed(autoStop, MAX_RING_MS)
  }

  private fun stopRinging() {
    releasePlayback()
    activeActivity?.get()?.finish()
    ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  private fun releasePlayback() {
    handler.removeCallbacks(autoStop)
    player?.run {
      try {
        stop()
      } catch (e: IllegalStateException) {
        // 이미 멈춤
      }
      release()
    }
    player = null
    vibrator?.cancel()
    vibrator = null
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }

  private fun startSound() {
    val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
      ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
      ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
      ?: return
    player = try {
      MediaPlayer().apply {
        setAudioAttributes(
          AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        )
        setDataSource(this@AlarmRingService, uri)
        isLooping = true
        prepare()
        start()
      }
    } catch (e: Exception) {
      null
    }
  }

  private fun startVibration() {
    val vib = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      (getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }
    val pattern = longArrayOf(0, 800, 600)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      vib.vibrate(VibrationEffect.createWaveform(pattern, 0))
    } else {
      @Suppress("DEPRECATION")
      vib.vibrate(pattern, 0)
    }
    vibrator = vib
  }

  private fun buildNotification(title: String): Notification {
    val fullScreen = PendingIntent.getActivity(
      this,
      0,
      AlarmRingActivity.intent(this, title),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle(title)
      .setContentText("알람이 울리고 있어요")
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setContentIntent(fullScreen)
      .setFullScreenIntent(fullScreen, true)
      .addAction(0, "다시 알림", actionPendingIntent(this, ACTION_SNOOZE))
      .addAction(0, "끄기", actionPendingIntent(this, ACTION_DISMISS))
      .build()
  }

  companion object {
    const val ACTION_START = "expo.modules.alarmclock.START"
    const val ACTION_DISMISS = "expo.modules.alarmclock.DISMISS"
    const val ACTION_SNOOZE = "expo.modules.alarmclock.SNOOZE"
    private const val EXTRA_ID = "id"
    private const val EXTRA_TITLE = "title"
    private const val CHANNEL_ID = "alarm_ringing"
    private const val NOTIFICATION_ID = 7301
    /** 아무도 끄지 않으면 10분 뒤 멈춘다 */
    private const val MAX_RING_MS = 10 * 60 * 1000L

    /** 지금 떠 있는 알람 화면 (알람이 멈추면 같이 닫는다) */
    var activeActivity: WeakReference<AlarmRingActivity>? = null

    fun startIntent(context: Context, id: String, title: String) =
      Intent(context, AlarmRingService::class.java).apply {
        action = ACTION_START
        putExtra(EXTRA_ID, id)
        putExtra(EXTRA_TITLE, title)
      }

    fun actionIntent(context: Context, action: String) =
      Intent(context, AlarmRingService::class.java).setAction(action)

    private fun actionPendingIntent(context: Context, action: String): PendingIntent =
      PendingIntent.getService(
        context,
        action.hashCode(),
        actionIntent(context, action),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )

    private fun ensureChannel(context: Context) {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
      val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      if (manager.getNotificationChannel(CHANNEL_ID) != null) return
      // 소리·진동은 서비스가 직접 내므로 채널은 조용하게
      val channel = NotificationChannel(CHANNEL_ID, "울리는 알람", NotificationManager.IMPORTANCE_HIGH).apply {
        setSound(null, null)
        enableVibration(false)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      }
      manager.createNotificationChannel(channel)
    }
  }
}
