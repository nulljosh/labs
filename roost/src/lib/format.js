import { formatMoney, formatMoneyCompact, formatArea } from './market'

// One place decides how a listing's numbers read, so the card, the map pin and
// the detail page can never disagree about currency or units.
export function listingFormatters(listing, locale, t) {
  const suffix = listing.mode === 'rent' ? t('per_month') : ''
  return {
    price: formatMoney(listing.price, listing.currency, locale) + suffix,
    priceCompact: formatMoneyCompact(listing.price, listing.currency, locale) + suffix,
    area: formatArea(listing.sqft, listing.imperial, locale)
  }
}
