package com.nulljosh.keyrate

import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowPosition
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import java.awt.event.ComponentAdapter
import java.awt.event.ComponentEvent
import java.util.prefs.Preferences

/** Windows, Mac and Linux: java.util.prefs keeps the best scores in the user's own profile. */
class DesktopStore(private val node: Preferences = Preferences.userRoot().node("com/nulljosh/keyrate")) : Store {
    override fun get(key: String): String? = node.get(key, null)
    override fun put(key: String, value: String) = node.put(key, value)
}

fun main() = application {
    val store = remember { DesktopStore() }
    // The window opens where it was left, at the size it was left (Bounds.kt); the first run centres at 980 by 720.
    val saved = remember { Bounds.read(store.get("window")) }
    val state = rememberWindowState(
        position = saved?.let { WindowPosition(it.x.dp, it.y.dp) } ?: WindowPosition.PlatformDefault,
        size = saved?.let { DpSize(it.width.dp, it.height.dp) } ?: DpSize(980.dp, 720.dp),
    )
    Window(onCloseRequest = ::exitApplication, title = "Keyrate", state = state) {
        // Read off the real window: WindowState keeps a platform-default position until the window is dragged.
        DisposableEffect(window) {
            val w = window
            val save = object : ComponentAdapter() {
                override fun componentMoved(e: ComponentEvent) = put()
                override fun componentResized(e: ComponentEvent) = put()
                fun put() = store.put("window", Bounds(w.x.toFloat(), w.y.toFloat(), w.width.toFloat(), w.height.toFloat()).save())
            }
            w.addComponentListener(save)
            save.put()
            onDispose { w.removeComponentListener(save) }
        }
        KeyrateApp(store)
    }
}
