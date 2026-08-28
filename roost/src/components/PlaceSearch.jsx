import { useEffect, useRef, useState } from 'react'
import { searchPlaces } from '../lib/geo'
import { usePlace } from '../context/PlaceContext'
import { useI18n } from '../i18n'
import './PlaceSearch.css'

export default function PlaceSearch() {
  const { place, setPlace } = usePlace()
  const { language, t } = useI18n()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  // Nominatim asks for at most one request a second, so the box waits for a
  // pause in typing rather than firing per keystroke.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const controller = new AbortController()
    setBusy(true)
    const timer = setTimeout(() => {
      searchPlaces(query, language, controller.signal)
        .then(setResults)
        .catch(err => { if (err.name !== 'AbortError') setResults([]) })
        .finally(() => setBusy(false))
    }, 500)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query, language])

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onClick)
    return () => document.removeEventListener('pointerdown', onClick)
  }, [])

  function choose(next) {
    setPlace(next)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div className="place-search" ref={boxRef}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={place.name || t('search_placeholder')}
        aria-label={t('search_placeholder')}
      />
      {open && query.trim().length >= 2 && (
        <ul className="place-results">
          {busy && <li className="place-result-empty">{t('searching')}</li>}
          {!busy && results.length === 0 && <li className="place-result-empty">{t('no_places')}</li>}
          {results.map(r => (
            <li key={r.id}>
              <button onClick={() => choose(r)}>
                <strong>{r.name}</strong>
                <span>{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
