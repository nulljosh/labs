// Playwright against the live site (or URL env). Needs epiphany's node_modules; Chrome channel, no download.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire('/Users/joshua/Documents/Code/epiphany/package.json')('playwright');
const URL = process.env.URL || 'https://fieldbook.jaybulb.com';

test('page renders, search filters, mark read persists', async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
  await page.goto(URL);
  const total = await page.locator('article').count();
  assert.ok(total >= 70, `articles: ${total}`);
  assert.equal(await page.locator('article svg.icon').count(), total, 'icon per article');
  await page.locator('#topology').scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
  assert.ok(await page.locator('#topology.in').count(), 'scroll-in class applied');
  await page.fill('#q', 'kidney');
  const visible = await page.locator('article:not(.hidden)').count();
  assert.ok(visible > 0 && visible < total, `filtered: ${visible}`);
  await page.fill('#q', '');
  await page.locator('#calculus .mark').click();
  assert.equal(await page.locator('#calculus .mark').textContent(), 'Read');
  await page.reload();
  assert.equal(await page.locator('#calculus .mark').textContent(), 'Read');
  assert.match(await page.locator('#progress').textContent(), /^1 of \d+ read$/);
  await page.locator('nav a[data-id="topology"]').click();
  assert.ok(await page.locator('#topology').isVisible());
  assert.ok(await page.locator('nav a.current').count(), 'scroll-spy highlights current');
  await page.keyboard.press('/');
  assert.ok(await page.locator('#q:focus').count(), 'slash focuses search');
  await page.keyboard.press('Escape');
  await page.keyboard.press('j');
  await page.waitForTimeout(400);
  assert.notEqual(await page.locator('nav a.current').getAttribute('data-id'), 'topology', 'j moves to next field');
  await page.goto(URL);
  assert.ok(await page.locator('#resume.show').count(), 'resume pill on a fresh visit');
  assert.equal(await page.locator('#graph .node').count(), total, 'one graph node per field');
  assert.ok(await page.locator('#graph line').count() > 200, 'graph has edges');
  assert.ok(await page.locator('#graph .node.hub').count() >= 5, 'hubs labelled');
  await page.locator('#graph .node[data-id="calculus"]').dispatchEvent("pointerenter");
  assert.ok(await page.locator('#map.focus .node.on').count() > 3, 'hover highlights neighbours');
  await page.locator('#graph .node[data-id="calculus"]').dispatchEvent("click");
  await page.waitForTimeout(600);
  assert.ok(page.url().endsWith('#calculus'), 'click jumps to field');
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/map.png', clip: { x: 260, y: 0, width: 1020, height: 900 } });
  await page.locator('#topology').scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/desktop.png', fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'screenshots/mobile.png' });
  } finally { await browser.close(); }
});
