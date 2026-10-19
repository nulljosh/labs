// Smallest check: the page parses and the code table covers the WMO codes Open-Meteo actually emits.
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('./web/index.html',import.meta.url),'utf8');
const codes=[...html.matchAll(/(\d+):'/g)].map(m=>+m[1]);
for(const c of [0,1,2,3,45,48,51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99]) if(!codes.includes(c)) throw new Error('missing code '+c);
if(!html.includes('api.open-meteo.com')) throw new Error('no forecast endpoint');
console.log('ok');
