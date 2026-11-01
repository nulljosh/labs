// Browser smoke test: open the test, pick quote, type the quote shown, and expect a result with 100 percent accuracy.
// Not part of `node --test` (it needs a browser). Run: node smoke.mjs [url], default the live app.
// Playwright comes from epiphany's node_modules with the installed Chrome; nothing is downloaded (see CLAUDE.md).
import { createRequire } from 'node:module'
const require = createRequire(new URL('../epiphany/package.json', import.meta.url))
const { chromium } = require('playwright')

const url = process.argv[2] || 'https://keyrate.jaybulb.com/app/'
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
try {
  await page.goto(url)
  await page.click('#modes button[data-mode="quote"]')
  const quote = (await page.locator('#words').innerText()).replace(/\s+/g, ' ').trim()
  if (!quote) throw new Error('no quote on screen')
  await page.focus('#sink')
  await page.keyboard.type(quote, { delay: 15 })
  await page.locator('#result').waitFor({ state: 'visible', timeout: 5000 })
  const wpm = await page.locator('#rWpm').innerText(), acc = await page.locator('#rAcc').innerText()
  if (!(+wpm > 0) || !acc.startsWith('100')) throw new Error(`result wpm ${wpm}, accuracy ${acc}`)
  console.log(`smoke ok: "${quote.slice(0, 40)}..." ${wpm} wpm, ${acc}`)
} finally {
  await browser.close()
}
