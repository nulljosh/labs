package com.nulljosh.keyrate

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge

/** Best scores live in this app's own SharedPreferences and nowhere else. */
class AndroidStore(context: Context) : Store {
    private val prefs = context.getSharedPreferences("keyrate", Context.MODE_PRIVATE)
    override fun get(key: String): String? = prefs.getString(key, null)
    override fun put(key: String, value: String) = prefs.edit().putString(key, value).apply()
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        val store = AndroidStore(this)
        setContent { KeyrateApp(store) }
        // Back sends the app behind, the way Android 12 and later treat a launcher activity, so a run in progress is
        // still there on return (Android 8 to 11 would otherwise destroy it). Rotation is kept by configChanges.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() { moveTaskToBack(true) }
        })
    }
}
