package com.sajid.jarvis

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.net.URLEncoder
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
            putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, false)
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Jarvis ko command boliye")
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
        val command = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull().orEmpty()
        handleCommand(command)
    }

    private fun normalize(text: String): String {
        return text.lowercase(Locale.ROOT)
            .replace("यूट्यूब", "youtube")
            .replace("यू ट्यूब", "youtube")
            .replace("यु ट्यूब", "youtube")
            .replace("यूट्यूब", "youtube")
            .replace("व्हाट्सऐप", "whatsapp")
            .replace("व्हाट्सएप", "whatsapp")
            .replace("वाट्सऐप", "whatsapp")
            .replace("जर्विस", "jarvis")
            .replace("जर्विस", "jarvis")
            .replace("खोल दो", " kholo ")
            .replace("खोलो", " kholo ")
            .replace("खोल", " kholo ")
            .replace("चालू करो", " chalao ")
            .replace("चालू कर दो", " chalao ")
            .replace("चला दो", " chalao ")
            .replace("चलाओ", " chalao ")
            .replace("ऑन करो", " on ")
            .replace("ऑन कर दो", " on ")
            .replace("ओपन करो", " open ")
            .replace("ओपन कर दो", " open ")
            .replace("शुरू करो", " start ")
            .replace("कर दो", " karo ")
            .replace("करो", " karo ")
            .replace(Regex("\\s+"), " ")
            .trim()
    }

    private fun handleCommand(command: String) {
        val original = command.trim()
        val q = normalize(original)
        val blocked = Regex("bank|banking|phonepe|phone pe|upi|paytm|gpay|google pay|payment|password|passcode|pin|otp|cvv|transaction")
        if (blocked.containsMatchIn(q)) {
            reply("Maaf kijiye, banking, UPI, payment, password, PIN aur OTP actions allowed nahi hain.")
            return
        }

        status.text = original

        val youtube = q.contains("youtube")
        val openAction = q.contains("open") || q.contains("on") || q.contains("start") ||
                q.contains("khol") || q.contains("chala") || q.contains("karo") ||
                q.contains("launch") || q.contains("shuru")

        when {
            youtube && openAction -> {
                val classRequest = q.contains("class") || q.contains("lecture") || q.contains("sir") ||
                        q.contains("video") || q.contains("padh") || q.contains("physics") ||
                        q.contains("chemistry") || q.contains("math") || q.contains("गणित") ||
                        q.contains("भौतिक") || q.contains("रसायन")

                if (!classRequest) {
                    val launch = packageManager.getLaunchIntentForPackage("com.google.android.youtube")
                    if (launch != null) {
                        startActivity(launch)
                        reply("Bilkul Sir, YouTube khol raha hoon.")
                    } else {
                        openUrl("https://www.youtube.com", "Bilkul Sir, YouTube khol raha hoon.")
                    }
                } else {
                    val search = q.replace("jarvis", "").trim()
                    openUrl(
                        "https://www.youtube.com/results?search_query=" + URLEncoder.encode(search, "UTF-8"),
                        "Bilkul Sir, YouTube par aapki class search kar raha hoon."
                    )
                }
            }
            q.contains("study website") || q.contains("preparation website") || q.contains("study web") ->
                openUrl("https://my-website-h5fw.onrender.com", "Aapki study website khol raha hoon.")
            q.contains("whatsapp") && openAction -> openApp("com.whatsapp", "WhatsApp khol raha hoon.")
            (q.contains("chrome") || q.contains("browser")) && openAction ->
                openUrl("https://www.google.com", "Browser khol raha hoon.")
            else -> reply("Command samajh gaya, lekin ye action abhi Jarvis mein available nahi hai.")
        }
    }

    private fun openUrl(url: String, message: String) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
            reply(message)
        } catch (_: Exception) {
            reply("Sir, ye action phone par open nahi ho paya.")
        }
    }

    private fun openApp(pkg: String, message: String) {
        val intent = packageManager.getLaunchIntentForPackage(pkg)
        if (intent != null) {
            startActivity(intent)
            reply(message)
        } else {
            reply("Sir, ye app phone mein nahi mili.")
        }
    }

    private fun reply(message: String) {
        status.text = message
        if (::tts.isInitialized) tts.speak(message, TextToSpeech.QUEUE_FLUSH, null, "jarvis")
    }

    override fun onInit(statusCode: Int) {
        tts.language = Locale("hi", "IN")
    }

    override fun onDestroy() {
        tts.shutdown()
        super.onDestroy()
    }
}
