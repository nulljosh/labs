import assert from 'assert';
import { render } from './build-roadmap.mjs';
const { html, done, total } = render('# R\n\n## Road to v100\n\nIntro line.\n\n### Era 1: a <deeper> game\n- [x] **v8 First lines.** Name the book.\n- [ ] **v9 Decades.** Filter. *Blocked on Joshua: a key.*\n\n## Other\n- [ ] not this\n');
assert.strictEqual(done, 1); assert.strictEqual(total, 2, 'stops at the next section');
assert(html.includes('<li class="done"><b>v8 First lines.</b> Name the book.</li>'));
assert(html.includes('<small><em>Blocked on Joshua: a key.</em></small>'), 'notes show under the line');
assert(html.includes('a &lt;deeper&gt; game'), 'escaped');
console.log('build-roadmap ok');
