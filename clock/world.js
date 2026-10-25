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
function offsetLabel(zone, now) {
  const here = new Date(now.toLocaleString('en-US')), there = new Date(now.toLocaleString('en-US', { timeZone: zone }));
  const diff = Math.round((there - here) / 36e5 * 4) / 4;
  const day = there.getDate() === here.getDate() ? 'Today' : there > here ? 'Tomorrow' : 'Yesterday';
  return `${day}, ${diff === 0 ? 'same time' : (diff > 0 ? '+' : '') + diff + ' HRS'}`;
}
function drawZones(now = new Date()) {
  $('zones').innerHTML = zones.length ? zones.map((z, i) => `
    <div class="row"><div class="grow"><div class="meta">${offsetLabel(z.zone, now)}</div><div class="label">${esc(z.city)}</div></div>
    ${worldEditing
      ? `<button class="icon" data-up="${i}" aria-label="Move ${esc(z.city)} up" ${i ? '' : 'disabled'}>Up</button><button class="icon danger" data-rm="${i}" aria-label="Remove ${esc(z.city)}">Remove</button>`
      : `<div class="time num">${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: z.zone }).format(now)}</div>`}
    </div>`).join('') : '<div class="empty">No cities yet. Search above to add one.</div>';
}
$('zones').onclick = (e) => {
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
