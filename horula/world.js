// World clocks: search by city name. Zone ids cover most cities; the rest are aliases.
const allZones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC', 'America/Vancouver', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
const CITIES = new Map(Object.entries(ALIASES));
allZones.forEach(z => { if (z.includes('/') && !z.startsWith('Etc/')) CITIES.set(z.split('/').pop().replaceAll('_', ' '), z); });
// About 400 options: filled the first time someone searches, so the page starts light.
$('citySearch').addEventListener('focus', () => { if (!$('cityList').children.length) $('cityList').innerHTML = [...CITIES.keys()].sort().map(c => `<option value="${esc(c)}">`).join(''); }, { once: true });
const cityZone = (c) => typeof c === 'string' ? { city: c.split('/').pop().replaceAll('_', ' '), zone: c } : c;
let zones = store.get('zones', ['America/New_York', 'Europe/London', 'Asia/Tokyo']).map(cityZone);
let worldEditing = false;
// Scrub moves every city's time together, in 15 minute steps, to find an hour that suits everyone.
const scrubMs = () => +$('scrub').value * 15 * 60000;
const zoneFmt = (zone) => new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit', timeZone: zone });
const SUN = `<svg class="dn" viewBox="0 0 24 24" role="img" aria-label="${tr('Day')}"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>`;
const MOON = `<svg class="dn" viewBox="0 0 24 24" role="img" aria-label="${tr('Night')}"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>`;
// Wide windows show each city as a small face, like macOS Clock; CSS hides it on phones.
const MINI_TICKS = Array.from({ length: 12 }, (_, i) => `<line class="tick" y1="-40" y2="-34" stroke-width="2" transform="rotate(${i * 30})"/>`).join('');
const miniFace = (z, at, day) => { const a = handAngles(z.zone, at);
  return `<svg class="mini${day === false ? ' night' : ''}" viewBox="-50 -50 100 100" aria-hidden="true"><circle class="rim" r="47"/>${MINI_TICKS}<line class="hand" y2="-22" stroke-width="4" transform="rotate(${a.h})"/><line class="hand" y2="-34" stroke-width="3" transform="rotate(${a.m})"/><circle class="hub" r="3"/></svg>`; };
const dayAt = (z, at) => { const c = COORDS[z.city]; return c ? isDaytime(at, c[0], c[1]) : null; };
function drawZones() {
  const shift = scrubMs(), at = new Date(Date.now() + shift);
  $('scrubText').textContent = shift ? tr('{0} from now', `${shift > 0 ? '+' : '-'}${Math.floor(Math.abs(shift) / 36e5)}:${pad(Math.abs(shift) / 60000 % 60)}`) : tr('Now');
  $('scrubReset').hidden = !shift;
  $('zones').innerHTML = zones.length ? zones.map((z, i) => {
    const day = dayAt(z, at);
    return `<div class="row">${worldEditing
      ? `<div class="grow"><div class="meta">${offsetLabel(z.zone, at)}</div><div class="label">${esc(z.city)}</div></div>
         <button class="icon" data-up="${i}" aria-label="Move ${esc(z.city)} up" ${i ? '' : 'disabled'}>${tr('Up')}</button><button class="icon danger" data-rm="${i}" aria-label="Remove ${esc(z.city)}">${tr('Remove')}</button>`
      : `<button class="grow rowbtn zone" data-city="${i}">
         ${miniFace(z, at, day)}<span class="grow"><span class="meta">${offsetLabel(z.zone, at)}</span><span class="label">${esc(z.city)}</span></span>
         ${day == null ? '' : day ? SUN : MOON}<span class="time">${timeHTML(zoneFmt(z.zone), at)}</span></button>`}</div>`;
  }).join('') : `<div class="empty">${tr('No cities yet. Search above to add one.')}</div>`;
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
  $('cityRise').innerHTML = t ? timeHTML(f, t.rise) : tr('None today');
  $('citySet').innerHTML = t ? timeHTML(f, t.set) : tr('None today');
  $('cityLen').textContent = t ? `${Math.floor((t.set - t.rise) / 36e5)} hr ${Math.round((t.set - t.rise) / 60000 % 60)} min` : tr(isDaytime(now, c[0], c[1]) ? 'Sun all day' : 'Dark all day');
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
$('worldEdit').onclick = () => { worldEditing = !worldEditing; $('worldEdit').textContent = tr(worldEditing ? 'Done' : 'Edit'); drawZones(); };
function addCity() {
  const name = $('citySearch').value.trim();
  const key = [...CITIES.keys()].find(c => c.toLowerCase() === name.toLowerCase());
  if (!key) { toast(name ? tr('No city named {0}', name) : tr('Type a city name')); return; }
  if (!zones.some(z => z.city === key)) { zones.push({ city: key, zone: CITIES.get(key) }); store.set('zones', zones); }
  $('citySearch').value = ''; drawZones();
}
$('cityAdd').onclick = addCity;
$('citySearch').onkeydown = (e) => { if (e.key === 'Enter') addCity(); };
$('citySearch').onchange = () => { if (CITIES.has($('citySearch').value)) addCity(); };
