package com.nulljosh.keyrate

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.time.TimeSource

// Colours from the shared tokens (warm paper and charcoal), accent from brand/BRAND.md.
// dim is small text (4.5:1 needed), word is the large upcoming words (3:1 needed)
private class Palette(val bg: Color, val text: Color, val dim: Color, val word: Color, val chip: Color, val bad: Color, val hi: Color)

private val Light = Palette(Color(0xFFF5F0E4), Color(0xFF1F1B16), Color(0xA81F1B16), Color(0x851F1B16), Color(0xFFEBE4D3), Color(0xFFC0392B), Color(0x40E69A00))
private val Dark = Palette(Color(0xFF1C1A17), Color(0xFFF3EDE0), Color(0xA8F3EDE0), Color(0x85F3EDE0), Color(0xFF26231F), Color(0xFFD9503F), Color(0x40E69A00))


@Composable
fun KeyrateApp(store: Store) {
    val p = if (isSystemInDarkTheme()) Dark else Light
    val scheme = if (isSystemInDarkTheme()) darkColorScheme(background = p.bg, surface = p.bg, onSurface = p.text)
    else lightColorScheme(background = p.bg, surface = p.bg, onSurface = p.text)
    MaterialTheme(colorScheme = scheme) {
        Surface(color = p.bg, modifier = Modifier.fillMaxSize()) { TestScreen(store, p) }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun TestScreen(store: Store, p: Palette) {
    var mode by remember { mutableStateOf(MODES[2]) }
    var punct by remember { mutableStateOf(false) }
    var round by remember { mutableIntStateOf(0) }
    val lastQuote = remember { arrayOfNulls<String>(1) }
    val session = remember(mode, punct, round) {
        Session(mode, punct, avoid = lastQuote[0]).also { if (mode.kind == Kind.Quote) lastQuote[0] = it.target.joinToString(" ") }
    }
    var rev by remember(session) { mutableIntStateOf(0) }
    var field by remember(session) { mutableStateOf(TextFieldValue("")) }
    var best by remember(session) { mutableIntStateOf(0) }
    var focused by remember { mutableStateOf(false) }
    val focus = remember { FocusRequester() }
    val keyboard = LocalSoftwareKeyboardController.current
    val clock = remember { TimeSource.Monotonic.markNow() }
    fun nowMs() = clock.elapsedNow().inWholeMilliseconds + 1 // never 0, Session reads 0 as "not started"
    fun refocus() { focus.requestFocus(); keyboard?.show() }

    LaunchedEffect(session) {
        refocus()
        while (true) {
            delay(100)
            if (session.started && !session.done) { session.tick(nowMs()); rev++ }
        }
    }
    val done = rev.let { session.done }
    LaunchedEffect(done) { if (done) best = recordRun(store, mode, session.result!!.wpm) }

    val lineHeight = 42.sp
    val windowHeight = with(LocalDensity.current) { (lineHeight * 3).toDp() }
    val (words, activeOffset) = remember(rev, session, p) { wordsText(session, p) }
    var layout by remember { mutableStateOf<TextLayoutResult?>(null) }
    val scroll = rememberScrollState()
    // keep the active line second from the top of the 3-line window
    LaunchedEffect(layout, activeOffset) {
        val l = layout ?: return@LaunchedEffect
        if (activeOffset < l.layoutInput.text.length) scroll.scrollTo(l.getLineTop(max(0, l.getLineForOffset(activeOffset) - 1)).roundToInt())
    }

    Column(
        Modifier.fillMaxSize().safeDrawingPadding().verticalScroll(rememberScrollState()).padding(horizontal = 24.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp, Alignment.CenterVertically),
    ) {
        Text("Keyrate", color = p.text.copy(alpha = .6f), fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            MODES.forEach { m -> Chip(m.label, m == mode, p) { mode = m } }
            Chip("punct", punct, p) { punct = !punct }
            Chip("restart", false, p) { round++ }
        }
        Text(
            when {
                done -> " "
                mode.kind == Kind.Time -> session.remaining(nowMs()).toString()
                else -> "${min(session.typed.size - 1, session.total)}/${session.total}"
            },
            color = p.dim, fontSize = 18.sp,
        )
        Box(
            Modifier.widthIn(max = 832.dp).fillMaxWidth().height(windowHeight).clipToBounds()
                .alpha(if (done || !focused) .35f else 1f)
                .clickable(remember { MutableInteractionSource() }, indication = null) { refocus() }
                .verticalScroll(scroll, enabled = false),
        ) {
            Text(words, fontSize = 26.sp, lineHeight = lineHeight, onTextLayout = { layout = it })
        }
        BasicTextField(
            value = field,
            onValueChange = { nv ->
                // the input holds every word typed; a refused edit puts the old text back
                if (!session.done) {
                    session.setText(nv.text, nowMs())
                    field = TextFieldValue(session.text, TextRange(session.text.length))
                    rev++
                }
            },
            modifier = Modifier.size(1.dp).semantics { contentDescription = "Type the words shown" }.focusRequester(focus).onFocusChanged { focused = it.isFocused }
                .onPreviewKeyEvent { e ->
                    val restart = e.type == KeyEventType.KeyDown && (e.key == Key.Tab || (session.done && e.key == Key.Enter))
                    if (restart) round++
                    restart
                },
            textStyle = TextStyle(color = Color.Transparent),
            cursorBrush = SolidColor(Color.Transparent),
            keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.None, autoCorrectEnabled = false),
        )
        val result = session.result
        if (result != null) {
            Column(Modifier.semantics { liveRegion = LiveRegionMode.Polite }, horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(result.wpm.toString(), color = p.text, fontSize = 64.sp, fontWeight = FontWeight.SemiBold)
                    Text(" wpm", color = p.dim, fontSize = 16.sp, modifier = Modifier.padding(bottom = 12.dp))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                    Stat("accuracy", "${result.accuracy}%", p)
                    Stat("raw", result.raw.toString(), p)
                    Stat("chars", "${result.correct}/${result.wrong}", p)
                }
                Text("best $best wpm · ${if (mode.kind == Kind.Time) "${mode.n}s" else mode.label}", color = p.dim, fontSize = 14.sp)
                Sparkline(runs(store), p)
                Text("Enter restarts.", color = p.dim, fontSize = 13.sp)
            }
        } else {
            Text("Start typing. Tab restarts.", color = p.dim, fontSize = 14.sp, textAlign = TextAlign.Center)
        }
    }
}

@Composable
private fun Chip(label: String, on: Boolean, p: Palette, onClick: () -> Unit) {
    Text(
        label, color = if (on) p.text else p.dim, fontSize = 14.sp,
        modifier = Modifier.clickable(remember { MutableInteractionSource() }, indication = null, onClick = onClick)
            .background(if (on) p.chip else Color.Transparent, RoundedCornerShape(50)).padding(horizontal = 12.dp, vertical = 8.dp),
    )
}

@Composable
private fun Stat(label: String, value: String, p: Palette) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = p.dim, fontSize = 12.sp)
        Text(value, color = p.text, fontSize = 20.sp)
    }
}

@Composable
private fun Sparkline(runs: List<Int>, p: Palette) {
    if (runs.size < 2) return
    val top = max(runs.max(), 1)
    Canvas(Modifier.size(240.dp, 40.dp)) {
        val pts = runs.mapIndexed { i, v -> Offset(2f + i.toFloat() / (runs.size - 1) * (size.width - 4f), size.height - 2f - v.toFloat() / top * (size.height - 4f)) }
        for (i in 1 until pts.size) drawLine(p.text, pts[i - 1], pts[i], strokeWidth = 3f, cap = StrokeCap.Round)
    }
}

/** The words, coloured by what was typed, plus the offset where the active word starts. */
private fun wordsText(s: Session, p: Palette): Pair<AnnotatedString, Int> {
    var active = 0
    val text = buildAnnotatedString {
        val cur = s.typed.lastIndex
        s.target.forEachIndexed { k, t ->
            if (k == cur) active = length
            val ty = s.typed.getOrElse(k) { "" }
            val wrongDone = k < cur && ty != t
            for (c in 0 until max(t.length, ty.length)) {
                var style = when {
                    c >= t.length -> SpanStyle(color = p.bad.copy(alpha = .6f))
                    c < ty.length -> SpanStyle(color = if (ty[c] == t[c]) p.text else p.bad)
                    else -> SpanStyle(color = p.word)
                }
                if (wrongDone) style = style.merge(SpanStyle(textDecoration = TextDecoration.Underline))
                if (k == cur && c == ty.length) style = style.merge(SpanStyle(background = p.hi))
                withStyle(style) { append(if (c >= t.length) ty[c] else t[c]) }
            }
            // the space after the word is where the caret sits once the word is complete
            withStyle(if (k == cur && ty.length >= t.length) SpanStyle(background = p.hi) else SpanStyle()) { append(" ") }
        }
    }
    return text to active
}
