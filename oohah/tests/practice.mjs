// One person alone gets a practice call with Momo, clearly labelled, and every button works
// locally. Run against wrangler dev (or OOHAH_QA_URL); the lobby must be otherwise empty.
import { chromium } from 'playwright-core';

const origin = process.env.OOHAH_QA_URL || 'http://localhost:8789';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
});
try {
  const page = await (await browser.newContext({ permissions: ['camera', 'microphone'] })).newPage();
  await page.goto(`${origin}/app`);
  await page.locator('#terms').check();
  await page.locator('#agree').click();
  await page.locator('#start').click();
  await page.locator('#status').getByText('Practice call').waitFor({ timeout: 15000 });
  await page.locator('#momo').getByText('not a person').waitFor();
  if (!(await page.locator('#block').isDisabled())) throw new Error('block must be off in practice');
  await page.locator('#log').getByText("I'm Momo").waitFor();
  await page.locator('#text').fill('hello iri');
  await page.locator('#say button').click();
  await page.locator('#log li').nth(2).waitFor();
  await page.locator('#more').click();
  await page.locator('#log').getByText('More time too').waitFor();
  await page.locator('#keep').click();
  await page.locator('#banner').getByText('@oohah').waitFor();
  await page.locator('#stop').click();
  await page.locator('#momo').waitFor({ state: 'hidden' });
  console.log('Practice QA passed: label, chat, more time, keep, stop.');
} finally {
  await browser.close();
}
