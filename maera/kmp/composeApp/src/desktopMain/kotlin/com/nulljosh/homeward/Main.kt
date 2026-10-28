package com.nulljosh.homeward

import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import java.awt.Desktop
import java.net.URI

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "Maera",
        state = rememberWindowState(width = 1040.dp, height = 720.dp),
    ) {
        MaeraTheme {
            BoardScreen(openWeb = { url ->
                runCatching { Desktop.getDesktop().browse(URI(url)) }
            })
        }
    }
}
