package com.nulljosh.journal

import kotlin.test.Test
import kotlin.test.assertEquals

class FeedTest {
    @Test
    fun parsesAtomEntry() {
        val xml = """<feed><entry><title type="html">Waiting</title><link href="https://j/2026/09/06/waiting/" rel="alternate"/>
<published>2026-09-06T10:00:00-07:00</published><content type="html" xml:base="x"><![CDATA[<svg><text>art</text></svg><h2 id="s">Sunday</h2><p>Hello &amp; bye.</p>]]></content></entry></feed>"""
        val p = parseFeed(xml).single()
        assertEquals("Waiting", p.title)
        assertEquals("2026-09-06", p.date)
        assertEquals("https://j/2026/09/06/waiting/", p.url)
        assertEquals("Sunday\nHello & bye.", p.body)
    }
}
