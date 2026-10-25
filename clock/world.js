// World clocks: search by city name. Zone ids cover most cities; the rest are aliases.
const ALIASES = {
  'San Francisco': 'America/Los_Angeles', 'Seattle': 'America/Los_Angeles', 'Portland': 'America/Los_Angeles', 'San Diego': 'America/Los_Angeles',
  'Boston': 'America/New_York', 'Washington DC': 'America/New_York', 'Miami': 'America/New_York', 'Atlanta': 'America/New_York', 'Philadelphia': 'America/New_York',
  'Dallas': 'America/Chicago', 'Houston': 'America/Chicago', 'Austin': 'America/Chicago', 'Las Vegas': 'America/Los_Angeles', 'Calgary': 'America/Edmonton',
  'Ottawa': 'America/Toronto', 'Montreal': 'America/Toronto', 'Beijing': 'Asia/Shanghai', 'Mumbai': 'Asia/Kolkata', 'Delhi': 'Asia/Kolkata',
  'New Delhi': 'Asia/Kolkata', 'Bangalore': 'Asia/Kolkata', 'Osaka': 'Asia/Tokyo', 'Kyoto': 'Asia/Tokyo', 'Abu Dhabi': 'Asia/Dubai',
  'Barcelona': 'Europe/Madrid', 'Milan': 'Europe/Rome', 'Munich': 'Europe/Berlin', 'Frankfurt': 'Europe/Berlin', 'Zurich': 'Europe/Zurich',
  'Manchester': 'Europe/London', 'Edinburgh': 'Europe/London', 'Melbourne': 'Australia/Melbourne', 'Auckland': 'Pacific/Auckland', 'Rio de Janeiro': 'America/Sao_Paulo',
};
const allZones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC', 'America/Vancouver', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
const CITIES = new Map(Object.entries(ALIASES));
allZones.forEach(z => { if (z.includes('/') && !z.startsWith('Etc/')) CITIES.set(z.split('/').pop().replaceAll('_', ' '), z); });
$('cityList').innerHTML = [...CITIES.keys()].sort().map(c => `<option value="${esc(c)}">`).join('');
const cityZone = (c) => typeof c === 'string' ? { city: c.split('/').pop().replaceAll('_', ' '), zone: c } : c;
let zones = store.get('zones', ['America/New_York', 'Europe/London', 'Asia/Tokyo']).map(cityZone);
let worldEditing = false;
// Scrub moves every city's time together, in 15 minute steps, to find an hour that suits everyone.
const scrubMs = () => +$('scrub').value * 15 * 60000;
const zoneFmt = (zone) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: zone });
const SUN = '<svg class="dn" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>';
const MOON = '<svg class="dn" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
const dayAt = (z, at) => { const c = COORDS[z.city]; return c ? isDaytime(at, c[0], c[1]) : null; };
function drawZones() {
  const shift = scrubMs(), at = new Date(Date.now() + shift);
  $('scrubText').textContent = shift ? `${shift > 0 ? '+' : '-'}${Math.floor(Math.abs(shift) / 36e5)}:${pad(Math.abs(shift) / 60000 % 60)} from now` : 'Now';
  $('scrubReset').hidden = !shift;
  $('zones').innerHTML = zones.length ? zones.map((z, i) => {
    const day = dayAt(z, at);
    return `<div class="row">${worldEditing
      ? `<div class="grow"><div class="meta">${offsetLabel(z.zone, at)}</div><div class="label">${esc(z.city)}</div></div>
         <button class="icon" data-up="${i}" aria-label="Move ${esc(z.city)} up" ${i ? '' : 'disabled'}>Up</button><button class="icon danger" data-rm="${i}" aria-label="Remove ${esc(z.city)}">Remove</button>`
      : `<button class="grow rowbtn zone" data-city="${i}" aria-label="${esc(z.city)}, ${day === false ? 'night' : 'day'}, sunrise and sunset">
         <span class="grow"><span class="meta">${offsetLabel(z.zone, at)}</span><span class="label">${esc(z.city)}</span></span>
         ${day == null ? '' : day ? SUN : MOON}<span class="time">${timeHTML(zoneFmt(z.zone), at)}</span></button>`}</div>`;
  }).join('') : '<div class="empty">No cities yet. Search above to add one.</div>';
}
$('scrub').oninput = drawZones;
$('scrubReset').onclick = () => { $('scrub').value = 0; drawZones(); };
// Tap a city: its sunrise, sunset and length of day, in its own time.
function openCity(i) {
  const z = zones[i], c = COORDS[z.city], now = new Date(), f = zoneFmt(z.zone);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: z.zone }).formatToParts(now).map(p => [p.type, +p.value]));
  const t = c && sunTimes(new Date(parts.year, parts.month - 1, parts.day), c[0], c[1]);
  $('cityTitle').textContent = z.city;
  $('cityNow').innerHTML = `${timeHTML(f, now)}`;
  $('cityOffset').textContent = offsetLabel(z.zone, now);
  $('cityRise').innerHTML = t ? timeHTML(f, t.rise) : 'None today';
  $('citySet').innerHTML = t ? timeHTML(f, t.set) : 'None today';
  $('cityLen').textContent = t ? `${Math.floor((t.set - t.rise) / 36e5)} hr ${Math.round((t.set - t.rise) / 60000 % 60)} min` : (isDaytime(now, c[0], c[1]) ? 'Sun all day' : 'Dark all day');
  $('citySheet').showModal();
}
$('zones').onclick = (e) => {
  const city = e.target.closest('[data-city]');
  if (city) return openCity(+city.dataset.city);
  const { rm, up } = e.target.dataset;
  if (rm != null) zones.splice(+rm, 1);
  else if (up != null && +up > 0) [zones[up - 1], zones[up]] = [zones[up], zones[up - 1]];
  else return;
  store.set('zones', zones); drawZones();
};
$('worldEdit').onclick = () => { worldEditing = !worldEditing; $('worldEdit').textContent = worldEditing ? 'Done' : 'Edit'; drawZones(); };
function addCity() {
  const name = $('citySearch').value.trim();
  const key = [...CITIES.keys()].find(c => c.toLowerCase() === name.toLowerCase());
  if (!key) { toast(name ? `No city named ${name}` : 'Type a city name'); return; }
  if (!zones.some(z => z.city === key)) { zones.push({ city: key, zone: CITIES.get(key) }); store.set('zones', zones); }
  $('citySearch').value = ''; drawZones();
}
$('cityAdd').onclick = addCity;
$('citySearch').onkeydown = (e) => { if (e.key === 'Enter') addCity(); };
$('citySearch').onchange = () => { if (CITIES.has($('citySearch').value)) addCity(); };
