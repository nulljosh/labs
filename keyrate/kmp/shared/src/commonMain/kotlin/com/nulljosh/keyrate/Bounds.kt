package com.nulljosh.keyrate

/** A desktop window's last place and size, saved as "x,y,width,height" in points. */
data class Bounds(val x: Float, val y: Float, val width: Float, val height: Float) {
    fun save(): String = listOf(x, y, width, height).joinToString(",") { it.toInt().toString() }

    companion object {
        /** Null for anything unreadable or too small to use, so a bad value falls back to the default window. */
        fun read(s: String?): Bounds? {
            val n = s?.split(",")?.mapNotNull { it.trim().toFloatOrNull() } ?: return null
            if (n.size != 4 || n[2] < 400f || n[3] < 300f) return null
            return Bounds(n[0], n[1], n[2], n[3])
        }
    }
}
