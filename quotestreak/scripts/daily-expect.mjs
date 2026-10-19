// The web's Daily Quote for a spread of days, for ios/Checks to compare the Swift port against.
import fs from 'fs';
import { createRequire } from 'module';
const Daily = createRequire(import.meta.url)('../daily.js');
const bank = JSON.parse(fs.readFileSync(new URL('../quotes.json', import.meta.url)));
const days = [1, 2, 3, 100, 365, bank.length, bank.length + 1, 5000];
console.log(JSON.stringify(days.map(day => { const q = Daily.quoteFor(day, bank); return { day, quote: q.quote, options: q.options }; })));
