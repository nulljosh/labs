package com.nulljosh.keyrate

import androidx.compose.runtime.remember
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import java.util.prefs.Preferences

/** Windows, Mac and Linux: java.util.prefs keeps the best scores in the user's own profile. */
class DesktopStore(private val node: Preferences = Preferences.userRoot().node("com/nulljosh/keyrate")) : Store {
    override fun get(key: String): String? = node.get(key, null)
    override fun put(key: String, value: String) = node.put(key, value)
}

fun main() = application {
    val store = remember { DesktopStore() }
    Window(onCloseRequest = ::exitApplication, title = "Keyrate", state = rememberWindowState(size = DpSize(980.dp, 720.dp))) {
        KeyrateApp(store)
    }
}
