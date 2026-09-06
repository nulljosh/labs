package com.nulljosh.journal

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Muted = Color(0.45f, 0.45f, 0.45f)

/** List of posts from the live feed; tap one to read it. Same content the website shows, no SVGs. */
@Composable
fun JournalScreen() {
    var posts by remember { mutableStateOf<List<Post>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var open by remember { mutableStateOf<Post?>(null) }
    LaunchedEffect(Unit) { runCatching { fetchPosts() }.onSuccess { posts = it }.onFailure { error = it.message ?: "offline" } }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Column(Modifier.widthIn(max = 640.dp).fillMaxWidth()) {
            open?.let { p ->
                Text("back", color = Muted, fontSize = 13.sp, modifier = Modifier.clickable { open = null }.padding(bottom = 16.dp))
                Text(p.title, fontSize = 32.sp, fontWeight = FontWeight.Light)
                Text(p.date, color = Muted, fontSize = 13.sp, modifier = Modifier.padding(bottom = 20.dp))
                Text(p.body, fontSize = 16.sp, lineHeight = 26.sp)
                return@Column
            }
            Text("Journal", fontSize = 32.sp, fontWeight = FontWeight.Light, modifier = Modifier.padding(bottom = 20.dp))
            when {
                error != null -> Text(error!!, color = Muted)
                posts == null -> Text("loading", color = Muted)
                else -> posts!!.forEach { p ->
                    Column(Modifier.fillMaxWidth().clickable { open = p }.padding(vertical = 12.dp)) {
                        Text(p.date, color = Muted, fontSize = 12.sp)
                        Text(p.title, fontSize = 18.sp)
                    }
                    HorizontalDivider(color = Muted.copy(alpha = 0.25f))
                }
            }
        }
    }
}
