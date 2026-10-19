package com.nulljosh.fieldbook

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun FieldbookTheme(content: @Composable () -> Unit) =
    MaterialTheme(colorScheme = lightColorScheme(), content = content)

// ponytail: read state is in-memory only on Android/desktop. Persist via
// multiplatform-settings if anyone asks for it to survive a relaunch.
@Composable
fun AppScreen() {
    var selected by remember { mutableStateOf(allFields.first()) }
    var query by remember { mutableStateOf("") }
    var read by remember { mutableStateOf(setOf<String>()) }
    val shown = allFields.filter { query.isBlank() || it.name.contains(query, true) || it.body.contains(query, true) }
    val domains = shown.map { it.domain }.distinct()

    Surface {
        Row(Modifier.fillMaxSize()) {
            Column(Modifier.width(280.dp).fillMaxHeight().padding(16.dp)) {
                Text("Fieldbook", style = MaterialTheme.typography.titleLarge)
                Text("${read.size} of ${allFields.size} read", style = MaterialTheme.typography.bodySmall)
                OutlinedTextField(query, { query = it }, Modifier.fillMaxWidth().padding(vertical = 8.dp), placeholder = { Text("Search") }, singleLine = true)
                LazyColumn {
                    domains.forEach { d ->
                        item { Text(d.uppercase(), style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(top = 12.dp, bottom = 4.dp)) }
                        items(shown.filter { it.domain == d }) { f ->
                            TextButton(onClick = { selected = f }, Modifier.fillMaxWidth()) {
                                Text((if (f.name in read) "● " else "○ ") + f.name, Modifier.fillMaxWidth())
                            }
                        }
                    }
                }
            }
            Column(Modifier.weight(1f).fillMaxHeight().verticalScroll(rememberScrollState()).padding(24.dp)) {
                Text(selected.domain, style = MaterialTheme.typography.labelMedium)
                Text(selected.name, style = MaterialTheme.typography.headlineLarge)
                Text(selected.studies, style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(bottom = 12.dp))
                Text(selected.body, style = MaterialTheme.typography.bodyLarge)
                Spacer(Modifier.height(12.dp))
                selected.ideas.forEach { Text("• $it", Modifier.padding(vertical = 2.dp)) }
                Spacer(Modifier.height(12.dp))
                HorizontalDivider()
                Text("THE GAP", style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(top = 12.dp))
                Text(selected.gap, style = MaterialTheme.typography.bodyLarge)
                Button(onClick = { read = if (selected.name in read) read - selected.name else read + selected.name }, Modifier.padding(top = 16.dp)) {
                    Text(if (selected.name in read) "Read" else "Mark read")
                }
            }
        }
    }
}
