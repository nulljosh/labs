// Worldwide place lookup. Nominatim geocodes anywhere on earth for free and
// returns names in the caller's language, so there is no place table to keep.
// ponytail: no API key, no proxy. Nominatim asks for <=1 req/sec, which the
// debounced search box already respects.

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const OVERPASS = 'https://overpass-api.de/api/interpreter'

export const defaultPlace = {
  id: 'vancouver-bc',
  name: 'Vancouver',
  label: 'Vancouver, British Columbia, Canada',
  countryCode: 'CA',
  lat: 49.2827,
  lng: -123.1207,
  bbox: [49.198, -123.225, 49.317, -123.023]
}

function toPlace(r) {
  const [s, n, w, e] = r.boundingbox.map(Number)
  return {
    id: `${r.osm_type}-${r.osm_id}`,
    name: r.name || r.display_name.split(',')[0],
    label: r.display_name,
    countryCode: (r.address?.country_code || '').toUpperCase(),
    lat: Number(r.lat),
    lng: Number(r.lon),
    // Nominatim gives [south, north, west, east]; everything else here wants
    // [south, west, north, east].
    bbox: [s, w, n, e]
  }
}

export async function searchPlaces(query, language = 'en', signal) {
  if (!query.trim()) return []
  const url = `${NOMINATIM}?${new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '8',
    'accept-language': language,
    featureType: 'settlement'
  })}`
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Place search failed: ${res.status}`)
  const rows = await res.json()
  return rows.filter(r => r.boundingbox).map(toPlace)
}

// Real named streets inside the place, in the local script. Falls back to an
// empty list, and the generator then uses the place name itself.
export async function streetsNear(place, signal) {
  const [s, w, n, e] = clampBox(place.bbox)
  const query = `[out:json][timeout:20];way["highway"~"^(residential|living_street|tertiary|secondary|unclassified)$"]["name"](${s},${w},${n},${e});out tags center 120;`
  try {
    const res = await fetch(OVERPASS, { method: 'POST', body: query, signal })
    if (!res.ok) return []
    const data = await res.json()
    const seen = new Set()
    return data.elements
      .filter(el => el.center && el.tags?.name && !seen.has(el.tags.name) && seen.add(el.tags.name))
      .map(el => ({ name: el.tags.name, lat: el.center.lat, lng: el.center.lon }))
  } catch {
    return []
  }
}

// A country-sized bbox would ask Overpass for the whole nation. Cap the box at
// roughly a metro area around the centre.
function clampBox([s, w, n, e], maxDeg = 0.25) {
  const cy = (s + n) / 2
  const cx = (w + e) / 2
  return [
    Math.max(s, cy - maxDeg), Math.max(w, cx - maxDeg),
    Math.min(n, cy + maxDeg), Math.min(e, cx + maxDeg)
  ]
}
