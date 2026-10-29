package com.nulljosh.keyrate

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
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
    }
}
