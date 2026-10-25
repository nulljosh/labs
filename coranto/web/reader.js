// ponytail: seed list mirrors FeedStore.seedFeeds and journalFeed in the app. Two copies beats
// standing up an API to serve 17 URLs; if it drifts, nothing breaks but the defaults.
var JOURNAL = { title: 'Journal', url: 'https://journal.jaybulb.com/feed.xml' };
var SEEDS = [
  ['CBC', 'https://www.cbc.ca/webfeed/rss/rss-topstories'],
  ['The Guardian', 'https://www.theguardian.com/world/rss'],
  ['NPR', 'https://feeds.npr.org/1001/rss.xml'],
  ['BBC', 'https://feeds.bbci.co.uk/news/world/rss.xml'],
  ['Global News', 'https://globalnews.ca/feed/'],
  ['NBC News', 'https://feeds.nbcnews.com/nbcnews/public/news'],
  ['Wall Street Journal', 'https://feeds.content.dowjones.io/public/rss/RSSWorldNews'],
  ['National Post', 'https://nationalpost.com/feed'],
  ['Fox News', 'https://moxie.foxnews.com/google-publisher/latest.xml'],
  ['NY Post', 'https://nypost.com/feed/'],
  ['NY Post Opinion', 'https://nypost.com/opinion/feed/'],
  ['Daily Wire', 'https://www.dailywire.com/feeds/rss.xml'],
  ['Vancouver Sun', 'https://vancouversun.com/feed'],
  ['The Province', 'https://theprovince.com/feed'],
  ['Hacker News', 'https://hnrss.org/frontpage'],
  ['Daring Fireball', 'https://daringfireball.net/feeds/main']
].map(function (f) { return { title: f[0], url: f[1] }; });

var feeds = load(), entries = [];

function load() {
  try { return JSON.parse(localStorage.getItem('inkpress.feeds')) || SEEDS.slice(); }
  catch (e) { return SEEDS.slice(); }
}
function save() {
  try { localStorage.setItem('inkpress.feeds', JSON.stringify(feeds)); } catch (e) {}
  if (window.CorantoAccount) CorantoAccount.push();   // signed in: the account keeps the same list
}


function text(node, names) {
  for (var i = 0; i < names.length; i++) {
    var el = node.querySelector(names[i]);
    if (el && el.textContent.trim()) return el.textContent.trim();
  }
  return '';
}

var IMG_EXT = /\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i;

// A media/enclosure element is an image if it says so, or - declaring neither type nor
// medium - if the URL ends in an image extension.
function isImageEl(el, url) {
  var type = el.getAttribute('type');
  if (type) return /^image\//i.test(type);
  var medium = el.getAttribute('medium');
  if (medium) return medium.toLowerCase() === 'image';
  return IMG_EXT.test(url || '');
}

// Resolving against the entry link handles protocol-relative and plain relative srcs for
// free. Anything not http(s) is refused so data: blobs never become an <img src>.
function resolveImage(src, base) {
  if (!src) return '';
  try {
    var u = new URL(src, base || location.href);
    return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : '';
  } catch (e) { return ''; }
}

// media:* beats <enclosure> beats the first <img> in the body. Mirrors FeedParser.pickImage
// in the Swift app - the two parsers must agree or the same feed looks different per platform.
function imageFor(node, html, link) {
  var tags = ['media:thumbnail', 'media:content', 'enclosure'];
  for (var i = 0; i < tags.length; i++) {
    var els = node.getElementsByTagName(tags[i]);
    for (var j = 0; j < els.length; j++) {
      var url = els[j].getAttribute('url');
      if (!url) continue;
      if (tags[i] !== 'media:thumbnail' && !isImageEl(els[j], url)) continue;
      var got = resolveImage(url, link);
      if (got) return got;
    }
  }
  var art = node.getElementsByTagName('itunes:image')[0];   // podcast and some blog feeds put the art here
  if (art && resolveImage(art.getAttribute('href'), link)) return resolveImage(art.getAttribute('href'), link);
  var srcs = imageSrcs(html || '');
  for (var k = 0; k < srcs.length; k++) { var r = resolveImage(srcs[k], link); if (r) return r; }
  return '';
}

// Every image URL the body offers: lazy-load attributes before src (often a placeholder), the first srcset
// entry, 1 by 1 tracking pixels skipped. Mirrors JournalFeedService.imageSrcs in the app.
function imageSrcs(html) {
  var out = [], tags = html.match(/<img\b[^>]*>/gi) || [];
  tags.forEach(function (t) {
    if (/(width|height)\s*=\s*["']?1["'\s>]/i.test(t)) return;
    var found = {}, re = /\b(data-src|data-lazy-src|data-original|srcset|src)\s*=\s*["']([^"']+)["']/gi, m;
    while ((m = re.exec(t))) found[m[1].toLowerCase()] = m[2];
    ['data-src', 'data-lazy-src', 'data-original', 'src', 'srcset'].forEach(function (k) {
      if (found[k]) out.push(k === 'srcset' ? found[k].split(',')[0].trim().split(/\s+/)[0] : found[k]);
    });
  });
  return out;
}

// RSS <item> and Atom <entry> differ only in tag names and where the link lives.
function parse(xml, source) {
  var doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) return [];
  var nodes = doc.querySelectorAll('item, entry');
  return Array.prototype.map.call(nodes, function (n) {
    var link = text(n, ['link']) ||
      (n.querySelector('link[href]') ? n.querySelector('link[href]').getAttribute('href') : '');
    var d = text(n, ['pubDate', 'updated', 'published', 'dc\\:date']);
    var html = text(n, ['content\\:encoded', 'content', 'description', 'summary']);
    return {
      title: text(n, ['title']) || '(untitled)',
      url: link,
      date: d ? new Date(d) : new Date(0),
      html: html,
      image: imageFor(n, html, link),
      source: source
    };
  }).filter(function (e) { return e.url; });
}

async function refresh() {
  lastRefresh = Date.now();
  document.getElementById('entries').innerHTML = '<li class="muted">Loading…</li>';
  var results = await Promise.all(feeds.map(async function (f) {
    try {
      var r = await fetch('/feed?url=' + encodeURIComponent(f.url));
      if (!r.ok) return [];
      return parse(await r.text(), f.title);
    } catch (e) { return []; }
  }));
  entries = [].concat.apply([], results).sort(function (a, b) { return b.date - a.date; });
  renderEntries();
}

function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

// "BBC" stays BBC; "Hacker News" is HN; "The Province" is P. Mirrors EntryThumbnail.initials in the app.
function initials(source) {
  var t = String(source || '').trim();
  if (t && t.length <= 4 && t === t.toUpperCase()) return t;
  var letters = t.split(/\s+/).filter(function (w) { return w && w.toLowerCase() !== 'the'; })
    .slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join('');
  return letters || 'C';
}

function dateText(d, style) {
  return d.getTime() ? d.toLocaleDateString(undefined, { dateStyle: style }) : '';
}

function renderEntries() {
  var ul = document.getElementById('entries');
  ul.innerHTML = '';
  if (!entries.length) { ul.appendChild(el('li', 'muted', 'No entries yet. Add a feed or refresh.')); return; }
  entries.slice(0, 300).forEach(function (e) {
    var btn = el('button', 'row');
    // Every row gets the same square: the image, or the outlet's initials when there is none or it fails to load.
    var mono = el('span', 'thumb mono', initials(e.source));
    mono.dataset.page = e.url;
    if (e.image) {
      var img = el('img', 'thumb');
      img.src = e.image; img.alt = ''; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
      img.onerror = function () { img.replaceWith(mono); };
      btn.appendChild(img);
    } else btn.appendChild(mono);
    var txt = el('span', 'txt');
    var b = el('b', '', e.title);
    b.title = e.title;
    b._v = Headline.variants(e.title, e.source);
    txt.appendChild(b);
    txt.appendChild(el('small', '', [e.source, dateText(e.date, 'medium')].filter(Boolean).join(' · ')));
    btn.appendChild(txt);
    btn.appendChild(el('span', 'chev', '›'));
    btn.onclick = function () { open(e); };
    var li = el('li'); li.appendChild(btn); ul.appendChild(li);
  });
  requestAnimationFrame(fitTitles);
  ul.querySelectorAll('.mono').forEach(function (m) { if (previewSeen) previewSeen.observe(m); else preview(m); });
}

// No image in the feed: ask /og for the article's preview image as the row scrolls in, and remember the answer
// (a miss too) so each page is asked once.
var previews = {};
try { previews = JSON.parse(localStorage.getItem('coranto.previews')) || {}; } catch (e) {}
function preview(mono) {
  var page = mono.dataset.page;
  if (!page) return;
  var show = function (src) {
    if (!src || !mono.isConnected) return;
    var img = el('img', 'thumb');
    img.alt = ''; img.referrerPolicy = 'no-referrer';
    img.onload = function () { if (mono.isConnected) mono.replaceWith(img); };
    img.src = src;
  };
  if (page in previews) return show(previews[page]);
  fetch('/og?url=' + encodeURIComponent(page)).then(function (r) { return r.ok ? r.json() : {}; }).then(function (d) {
    previews[page] = d.image || '';
    var keys = Object.keys(previews);
    if (keys.length > 1000) keys.slice(0, keys.length - 1000).forEach(function (k) { delete previews[k]; });
    try { localStorage.setItem('coranto.previews', JSON.stringify(previews)); } catch (e) {}
    show(previews[page]);
  }).catch(function () {});
}
var previewSeen = window.IntersectionObserver && new IntersectionObserver(function (seen) {
  seen.forEach(function (x) { if (x.isIntersecting) { previewSeen.unobserve(x.target); preview(x.target); } });
}, { rootMargin: '400px' });

// Each title becomes the longest headline variant that fits its row, so it ends on a word, not "…".
var measure = document.createElement('canvas').getContext('2d');
function fitTitles() {
  var bs = document.querySelectorAll('#entries b');
  if (!bs.length) return;
  var cs = getComputedStyle(bs[0]);
  measure.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
  bs.forEach(function (b) {
    var w = b.clientWidth, v = b._v || [b.title];
    // The canvas estimate jumps close; the live row has the final say (fonts may still be loading).
    var i = Math.max(0, v.findIndex(function (x) { return measure.measureText(x).width <= w; }));
    for (b.textContent = v[i]; b.scrollWidth > b.clientWidth && i < v.length - 1;) b.textContent = v[++i];
  });
}
var fitTimer;
addEventListener('resize', function () { clearTimeout(fitTimer); fitTimer = setTimeout(fitTitles, 100); });
// Refit once the web font lands (it is wider than the fallback) and whenever the list changes width.
if (document.fonts) { document.fonts.ready.then(fitTitles); document.fonts.addEventListener('loadingdone', fitTitles); }
if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(fitTimer); fitTimer = setTimeout(fitTitles, 50); }).observe(document.getElementById('entries'));

function renderFeeds() {
  var following = document.getElementById('following');
  following.innerHTML = '';
  feeds.forEach(function (f, i) {
    var row = el('div', 'row');
    var txt = el('span', 'txt');
    txt.appendChild(el('b', '', f.title)); txt.appendChild(el('small', '', f.url));
    var rm = el('button', 'act', 'Remove');
    rm.setAttribute('aria-label', 'Remove ' + f.title);
    rm.onclick = function () { feeds.splice(i, 1); save(); renderFeeds(); refresh(); };
    row.appendChild(txt); row.appendChild(rm);
    var li = el('li'); li.appendChild(row); following.appendChild(li);
  });
  if (!feeds.length) following.appendChild(el('li', 'muted', 'Not following anything yet.'));

  var spare = [JOURNAL].concat(SEEDS).filter(function (s) {
    return !feeds.some(function (f) { return f.url === s.url; });
  });
  var suggested = document.getElementById('suggested');
  suggested.innerHTML = '';
  document.getElementById('suggested-label').hidden = document.getElementById('suggested-group').hidden = !spare.length;
  spare.forEach(function (s) {
    var btn = el('button', 'row');
    var txt = el('span', 'txt');
    txt.appendChild(el('b', '', s.title)); txt.appendChild(el('small', '', s.url));
    btn.appendChild(txt); btn.appendChild(el('span', 'act', '+'));
    btn.setAttribute('aria-label', 'Follow ' + s.title);
    btn.onclick = function () { feeds.push(s); save(); renderFeeds(); refresh(); };
    var li = el('li'); li.appendChild(btn); suggested.appendChild(li);
  });
}

function show(e) {
  var box = document.getElementById('article');
  box.innerHTML = '';
  box.appendChild(el('h2', '', e.title));
  box.appendChild(el('p', 'meta', [e.source, dateText(e.date, 'long')].filter(Boolean).join(' · ')));
  // Feed HTML is untrusted: parse it inert and drop scripts and event handlers before
  // it ever reaches the live document.
  var frag = new DOMParser().parseFromString(e.html || '', 'text/html');
  frag.querySelectorAll('script, style, iframe, object, embed, link').forEach(function (n) { n.remove(); });
  frag.querySelectorAll('*').forEach(function (n) {
    Array.prototype.slice.call(n.attributes).forEach(function (a) {
      if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);
    });
  });
  Array.prototype.forEach.call(frag.body.childNodes, function (n) { box.appendChild(document.importNode(n, true)); });
  var p = el('p'), a = el('a', '', 'Open original');
  a.href = e.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  p.appendChild(a); box.appendChild(p);
}

// Tabs live in the hash so the browser's back button works; an open story is one extra
// history entry on top of Home.
var current = null;
function open(e) { current = e; history.pushState(null, '', '#story'); route(); }
function route() {
  var tab = location.hash.slice(1) || 'home';
  if (tab === 'story' && !current) tab = 'home';
  ['home', 'story', 'feeds', 'settings'].forEach(function (id) { document.getElementById(id).hidden = id !== tab; });
  if (tab === 'story') show(current);
  var lit = tab === 'story' ? 'home' : tab;
  document.querySelectorAll('.tabbar a').forEach(function (a) {
    if (a.dataset.tab === lit) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
addEventListener('popstate', route);
document.getElementById('back').onclick = function () { history.back(); };
// The system share sheet where there is one (phones, Safari), otherwise copy the link.
document.getElementById('share').onclick = function () {
  if (!current) return;
  var btn = this;
  if (navigator.share) { navigator.share({ title: current.title, url: current.url }).catch(function () {}); return; }
  navigator.clipboard.writeText(current.url).then(function () {
    btn.textContent = 'Link copied';
    setTimeout(function () { btn.textContent = 'Share'; }, 1500);
  });
};

document.getElementById('add-form').addEventListener('submit', function (ev) {
  ev.preventDefault();
  var input = document.getElementById('add'), note = document.getElementById('add-note');
  var v = input.value.trim();
  if (!v) return;
  if (!/^https?:/i.test(v)) v = 'https://' + v;
  var host;
  try { host = new URL(v).hostname; } catch (e) { host = ''; }
  if (!host || feeds.some(function (f) { return f.url === v; })) {
    note.textContent = 'That is not a new feed URL.';
    return;
  }
  feeds.push({ title: host, url: v });
  input.value = '';
  note.textContent = 'Paste any RSS or Atom feed URL to follow it.';
  save(); renderFeeds(); refresh();
});
// Pull to refresh: drag down from the top of Home. Coming back to the tab after 15 minutes refreshes too, which
// is how a desktop browser (no pull) stays current.
var pullStart = null, pulled = 0, lastRefresh = Date.now(), pullEl = document.getElementById('pull');
addEventListener('touchstart', function (ev) {
  pullStart = (scrollY <= 0 && !document.getElementById('home').hidden) ? ev.touches[0].clientY : null;
}, { passive: true });
addEventListener('touchmove', function (ev) {
  if (pullStart == null) return;
  pulled = Math.max(0, Math.min(96, (ev.touches[0].clientY - pullStart) / 2));
  pullEl.style.height = pulled + 'px';
  pullEl.classList.toggle('ready', pulled >= 56);
}, { passive: true });
addEventListener('touchend', function () {
  if (pullStart == null) return;
  pullStart = null;
  if (pulled >= 56) { pullEl.classList.add('busy'); refresh().then(done, done); } else done();
  function done() { pulled = 0; pullEl.style.height = ''; pullEl.classList.remove('ready', 'busy'); }
});
document.addEventListener('visibilitychange', function () {
  if (!document.hidden && Date.now() - lastRefresh > 15 * 6e4) refresh();
});

// Same range and default as the app's Settings stepper (13 to 28 pt, 17 default).
var textSize = 17;
try { textSize = +localStorage.getItem('coranto.textSize') || 17; } catch (e) {}
function applySize(n) {
  textSize = Math.min(28, Math.max(13, n));
  document.documentElement.style.setProperty('--read-size', textSize + 'px');
  document.getElementById('size-label').textContent = textSize + ' pt';
  document.getElementById('size-sample').style.fontSize = textSize + 'px';
  try { localStorage.setItem('coranto.textSize', textSize); } catch (e) {}
}
document.getElementById('size-down').onclick = function () { applySize(textSize - 1); };
document.getElementById('size-up').onclick = function () { applySize(textSize + 1); };
applySize(textSize);

route();
renderFeeds();
refresh();
