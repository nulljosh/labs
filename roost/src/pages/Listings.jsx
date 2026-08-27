import { useMemo } from 'react'
import { listings } from '../data/listings'
import { filterListings } from '../lib/filterListings'
import { useFilters } from '../context/FiltersContext'
import { useFavorites } from '../context/FavoritesContext'
import FilterBar from '../components/FilterBar'
import MapView from '../components/MapView'
import ListingCard from '../components/ListingCard'
import './Listings.css'

export default function Listings() {
  const { filters } = useFilters()
  const { favorites, favoriteSet } = useFavorites()

  const filtered = useMemo(
    () => filterListings(listings, filters, favoriteSet),
    [filters, favoriteSet]
  )

  return (
    <div className="page">
      <FilterBar resultCount={filtered.length} />
      <MapView listings={filtered} favorites={favorites} />
      <div className="listings-grid">
        {filtered.map((listing, i) => (
          <ListingCard key={listing.id} listing={listing} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="listings-empty fade-up">
            <h3>No listings found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
