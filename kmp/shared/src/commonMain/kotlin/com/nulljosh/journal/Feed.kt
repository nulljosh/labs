package com.nulljosh.journal

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText

const val FEED_URL = "https://journal.heyitsmejosh.com/feed.xml"

data class Post(val title: String, val date: String, val url: String, val body: String)

private fun tag(xml: String, name: String): String? =
    Regex("<$name[^>]*>(.*?)</$name>", RegexOption.DOT_MATCHES_ALL).find(xml)?.groupValues?.get(1)

private fun unescape(s: String) = s
    .replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&#39;", "'").replace("&amp;", "&")

/** Post HTML to reading text. Drops the inlined header/graph SVGs, keeps paragraph breaks. */
fun plainText(html: String): String = html
    .replace(Regex("<svg.*?</svg>", RegexOption.DOT_MATCHES_ALL), "")
    .replace(Regex("<h2[^>]*>(.*?)</h2>", RegexOption.DOT_MATCHES_ALL), "\n\n$1\n")
    .replace(Regex("</p>|<br\\s*/?>"), "\n")
    .replace(Regex("<[^>]+>"), "")
    .let(::unescape)
    .replace(Regex("[ \\t]+\\n"), "\n")
    .replace(Regex("\\n{3,}"), "\n\n")
    .trim()

/** jekyll-feed writes Atom; each <entry> has title, published, link href and CDATA content. */
fun parseFeed(xml: String): List<Post> =
    Regex("<entry>(.*?)</entry>", RegexOption.DOT_MATCHES_ALL).findAll(xml).map { m ->
        val e = m.groupValues[1]
        val content = tag(e, "content")?.removePrefix("<![CDATA[")?.removeSuffix("]]>") ?: ""
        Post(
            title = tag(e, "title")?.let(::unescape) ?: "",
            date = tag(e, "published")?.take(10) ?: "",
            url = Regex("<link[^>]*href=\"([^\"]+)\"").find(e)?.groupValues?.get(1) ?: "",
            body = plainText(if ("<![CDATA[" in (tag(e, "content") ?: "")) content else unescape(content)),
        )
    }.toList()

suspend fun fetchPosts(http: HttpClient = HttpClient()): List<Post> = parseFeed(http.get(FEED_URL).bodyAsText())
