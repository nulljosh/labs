import { createContext, useContext, useEffect, useState } from 'react'
import { defaultPlace, streetsNear } from '../lib/geo'
import { generateListings } from '../data/listings'

const PlaceContext = createContext(null)
const STORAGE_KEY = 'roost-place'

function storedPlace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : defaultPlace
  } catch {
    return defaultPlace
  }
}

export function PlaceProvider({ children }) {
  const [place, setPlaceState] = useState(storedPlace)
  const [mode, setMode] = useState(() => localStorage.getItem('roost-mode') || 'sale')
  const [streets, setStreets] = useState([])
  const [loading, setLoading] = useState(true)

  // Street names come from Overpass once per place; the listings themselves are
  // derived, so there is nothing else to fetch when the sale/rent mode flips.
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    streetsNear(place, controller.signal)
      .then(setStreets)
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [place.id])

  const listings = generateListings(place, streets, mode)

  function setPlace(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setPlaceState(next)
  }

  function changeMode(next) {
    localStorage.setItem('roost-mode', next)
    setMode(next)
  }

  return (
    <PlaceContext.Provider value={{ place, setPlace, mode, setMode: changeMode, listings, loading }}>
      {children}
    </PlaceContext.Provider>
  )
}

export function usePlace() {
  return useContext(PlaceContext)
}
