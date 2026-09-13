package com.sajid.jarvis

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.util.Locale

class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {
    private lateinit var status: TextView
    private lateinit var tts: TextToSpeech
    private val voiceRequest = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        status = findViewById(R.id.status)
        tts = TextToSpeech(this, this)
        findViewById<Button>(R.id.mic).setOnClickListener { listen() }
        requestMicrophoneIfNeeded()
    }

    private fun requestMicrophoneIfNeeded() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            status.text = "🎙️ Microphone ready. Jarvis is ready for voice commands."
            return
        }
        status.text = "🎙️ Voice commands ke liye microphone permission required hai."
        ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECORD_AUDIO), voiceRequest)
    }

    private fun listen() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestMicrophoneIfNeeded()
            return
        }
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Jarvis ko poora command boliye...")
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 10)
            putExtra("android.speech.extra.SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS", 3500L)
            putExtra("android.speech.extra.SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS", 2500L)
            putExtra("android.speech.extra.SPEECH_INPUT_MINIMUM_LENGTH_MILLIS", 15000L)
        }
        startActivityForResult(intent, voiceRequest)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode != voiceRequest) return
        if (grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED) {
            status.text = "✅ Microphone permission mil gaya. Jarvis ready hai."
            reply("Microphone permission mil gaya. Jarvis ready hai.")
        } else {
            status.text = "⚠️ Microphone permission nahi mila. Voice commands ke liye Settings se permission allow karein."
        }
    }

    @Deprecated("Android callback API")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != voiceRequest || resultCode != RESULT_OK) return
        val results = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS).orEmpty()
        val command = results.firstOrNull().orEmpty()
        handleCommand(command)
    }

    private fun handleCommand(command: String) {
        val q = command.lowercase(Locale.ROOT).trim()
        status.text = "🗣️ $command"

        val blocked = Regex("bank|banking|phonepe|phone pe|upi|paytm|gpay|google pay|payment|password|passcode|pin|otp|cvv|transaction")
        if (blocked.containsMatchIn(q)) {
            reply("Maaf kijiye, banking, UPI, payment, password, PIN aur OTP actions allowed nahi hain.")
            return
        }

        // YouTube is intentionally recognized on its own. Natural commands such as
        // “YouTube on karo”, “YouTube kholo”, or Hindi “यूट्यूब चालू करो” should not
        // depend on a separate open-word match.
        val youtube = q.contains("youtube") || q.contains("यूट्यूब") || q.contains("यू ट्यूब")
        if (youtube) {
            val asksForClass = q.contains("class") || q.contains("lecture") || q.contains("sir") || q.contains("video") || q.contains("physics") || q.contains("chemistry") || q.contains("math") || q.contains("पढ़") || q.contains("क्लास") || q.contains("लेक्चर") || q.contains("वीडियो")
            if (asksForClass) {
                openUrl("https://www.youtube.com/results?search_query=" + java.net.URLEncoder.encode(command, "UTF-8"), "Bilkul Sir, YouTube par search khol raha hoon.")
            } else {
                val direct = packageManager.getLaunchIntentForPackage("com.google.android.youtube")
                if (direct != null) {
                    startActivity(direct)
                    reply("Bilkul Sir, YouTube khol raha hoon.")
                } else {
                    openUrl("https://www.youtube.com", "Bilkul Sir, YouTube khol raha hoon.")
                }
            }
            return
        }

        when {
            q.contains("study website") || q.contains("preparation website") || q.contains("study web") || q.contains("मेरी वेबसाइट") || q.contains("स्टडी वेबसाइट") -> openUrl("https://my-website-h5fw.onrender.com", "Aapki study website khol raha hoon.")
            q.contains("whatsapp") || q.contains("व्हाट्सऐप") || q.contains("व्हाट्सएप") -> openApp("com.whatsapp", "WhatsApp khol raha hoon.")
            q.contains("chrome") || q.contains("browser") || q.contains("ब्राउज़र") -> openUrl("https://www.google.com", "Browser khol raha hoon.")
            else -> reply("Command samajh gaya. Ye action abhi available nahi hai.")
        }
    }

    private fun openUrl(url: String, message: String) {
        startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url)))
        reply(message)
    }

    private fun openApp(pkg: String, message: String) {
        val intent = packageManager.getLaunchIntentForPackage(pkg)
        if (intent != null) startActivity(intent) else reply("Ye app phone mein nahi mili.")
        if (intent != null) reply(message)
    }

    private fun reply(message: String) {
        status.text = message
        if (::tts.isInitialized) tts.speak(message, TextToSpeech.QUEUE_FLUSH, null, "jarvis")
    }

    override fun onInit(statusCode: Int) { tts.language = Locale("hi", "IN") }
    override fun onDestroy() { tts.shutdown(); super.onDestroy() }
}
