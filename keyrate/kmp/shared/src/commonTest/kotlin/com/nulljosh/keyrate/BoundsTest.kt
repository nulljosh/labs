package com.nulljosh.keyrate

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class BoundsTest {
    @Test fun roundTrips() {
        val b = Bounds(120f, 80f, 980f, 720f)
        assertEquals("120,80,980,720", b.save())
        assertEquals(b, Bounds.read(b.save()))
    }

    @Test fun badValuesFallBack() {
        assertNull(Bounds.read(null))
        assertNull(Bounds.read("1,2,3"))
        assertNull(Bounds.read("a,b,c,d"))
        assertNull(Bounds.read("0,0,100,100"))
    }
}
