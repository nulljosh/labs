#!/usr/bin/env node
// Generates one real page per service and per service area from data/*.json,
// reusing index.html's <style>, header and footer so there is one source of
// truth for the design. Also writes sitemap.xml.
//
//   node build.js
//
// ponytail: string slicing, not a template engine. index.html is a single
// hand-maintained file; if it ever gains a build step of its own, revisit.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://bcgd.jaybulb.com';

const index = readFileSync(join(ROOT, 'index.html'), 'utf8');
const services = JSON.parse(readFileSync(join(ROOT, 'data/services.json'), 'utf8'));
const areas = JSON.parse(readFileSync(join(ROOT, 'data/areas.json'), 'utf8'));

function slice(start, end, label) {
  const a = index.indexOf(start);
  const b = index.indexOf(end, a + 1);
  if (a === -1 || b === -1) throw new Error(`Could not locate ${label} in index.html`);
  return index.slice(a, b);
}

const styles = slice('<style>', '</style>', 'stylesheet') + '</style>';
// Header runs from the progress bar through the mobile menu, i.e. everything
// before the homepage hero. Footer runs to </body> so the shared scripts
// (mobile menu, scroll handlers) come along with it.
const header = slice('<!-- READING PROGRESS BAR -->', '<!-- HERO', 'header');
const footer = slice('<!-- FOOTER -->', '</body>', 'footer');

// Sub-pages live one directory down, so root-relative the shared chunks.
const rootRelative = (html) => html
  .replace(/(src|href)="img\//g, '$1="/img/')
  .replace(/href="#/g, 'href="/#')
  .replace(/href="index\.html"/g, 'href="/"');

const HEADER = rootRelative(header);
const FOOTER = rootRelative(footer);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page({ path, title, description, h1, lead, signs, detail, jsonLd, related }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${esc(description)}">
    <title>${esc(title)}</title>
    <link rel="canonical" href="${SITE}${path}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${SITE}${path}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:image" content="${SITE}/img/truck.png">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
    ${styles}
</head>
<body>
${HEADER}
    <section class="section subpage-hero">
        <div class="section-inner">
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="/">Home</a> <span>/</span> <span>${esc(h1)}</span>
            </nav>
            <h1>${esc(h1)}</h1>
            <p class="subpage-lead">${esc(lead)}</p>
            <div class="subpage-cta">
                <a href="tel:6042400180" class="btn-primary">Call (604) 240-0180</a>
                <a href="/#contact" class="btn-secondary">Book a service call</a>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="section-inner subpage-body">
            <h2 class="section-title">${esc(signs.heading)}</h2>
            <ul class="subpage-list">
                ${signs.items.map(s => `<li>${esc(s)}</li>`).join('\n                ')}
            </ul>
            <p class="subpage-detail">${esc(detail)}</p>
            <h2 class="section-title">${esc(related.heading)}</h2>
            <div class="subpage-links">
                ${related.links.map(l => `<a href="${l.href}">${esc(l.label)}</a>`).join('\n                ')}
            </div>
        </div>
    </section>
${FOOTER}
</body>
</html>
`;
}

function write(path, html) {
  const dir = join(ROOT, path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

const serviceLinks = services.map(s => ({ href: `/${s.slug}/`, label: s.name }));
const areaLinks = areas.map(a => ({ href: `/service-areas/${a.slug}/`, label: a.name }));

const paths = ['/'];

for (const s of services) {
  const path = `/${s.slug}/`;
  paths.push(path);
  write(s.slug, page({
    path,
    title: `${s.name} in Langley & the Lower Mainland | BC Garage Doors`,
    description: `${s.lead} Call (604) 240-0180 for ${s.name.toLowerCase()} in Langley, Surrey and across the Lower Mainland.`,
    h1: `${s.name} in Langley, BC`,
    lead: s.lead,
    signs: { heading: 'Signs you need this service', items: s.signs },
    detail: s.detail,
    related: {
      heading: 'Other repairs we handle',
      links: serviceLinks.filter(l => l.href !== path),
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: s.name,
      serviceType: s.name,
      description: s.lead,
      areaServed: areas.map(a => ({ '@type': 'City', name: a.name })),
      provider: {
        '@type': 'LocalBusiness',
        '@id': `${SITE}/#business`,
        name: 'BC Garage Doors',
        telephone: '+1-604-240-0180',
      },
    },
  }));
}

for (const a of areas) {
  const path = `/service-areas/${a.slug}/`;
  paths.push(path);
  write(join('service-areas', a.slug), page({
    path,
    title: `Garage Door Repair in ${a.name}, BC | BC Garage Doors`,
    description: `Family-owned garage door repair serving ${a.name}, BC. 30+ years, 24/7 emergency service, 4.9/5 from 128 reviews. Call (604) 240-0180.`,
    h1: `Garage Door Repair in ${a.name}, BC`,
    lead: a.blurb,
    signs: {
      heading: `What we do in ${a.name}`,
      items: [
        'Broken torsion spring replacement, usually same day',
        'Cable, roller, hinge and track repair',
        'Opener, remote and keypad service (LiftMaster specialists)',
        '24/7 emergency callouts for doors stuck open or off-track',
      ],
    },
    detail: `We are a repair-only shop, which means nobody arrives in ${a.name} trying to sell you a new door. A technician diagnoses the fault, explains the cost before starting, and carries the common parts on the truck so most jobs finish in one visit.`,
    related: {
      heading: 'Other areas we serve',
      links: areaLinks.filter(l => l.href !== path),
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'BC Garage Doors',
      '@id': `${SITE}/#business`,
      url: `${SITE}${path}`,
      telephone: '+1-604-240-0180',
      areaServed: { '@type': 'City', name: a.name, containedInPlace: { '@type': 'AdministrativeArea', name: 'British Columbia' } },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '128' },
    },
  }));
}

// Cloudflare Pages serves this with a real 404 status. Without it, unknown
// paths return 200 with the homepage, which reads as a soft-404 to crawlers.
writeFileSync(join(ROOT, '404.html'), page({
  path: '/404.html',
  title: 'Page not found | BC Garage Doors',
  description: 'That page does not exist. Call (604) 240-0180 for garage door repair in Langley and the Lower Mainland.',
  h1: 'Page not found',
  lead: 'That page does not exist, but the door still needs fixing. Call us and we will sort it out.',
  signs: { heading: 'Try one of these', items: ['Broken spring or cable', 'Noisy or off-track door', 'Opener, remote or keypad trouble', '24/7 emergency repair'] },
  detail: 'Call (604) 240-0180 any hour, or head back to the homepage to book a service call.',
  related: { heading: 'Services', links: serviceLinks },
  jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Page not found' },
}));

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(p => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><priority>${p === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`);

console.log(`Generated ${services.length} service pages, ${areas.length} area pages, sitemap with ${paths.length} urls.`);
