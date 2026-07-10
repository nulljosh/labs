#!/usr/bin/env python3
# Rebuilds index.html from ~/.claude memory files. Run after memories change.
import os, re, json
MEM = os.path.expanduser('~/.claude/projects/-Users-joshua/memory')
def cat(i):
    i = i.replace('-', '_')
    for p in ('feedback', 'project', 'user', 'reference'):
        if i.startswith(p): return p
    return 'project'
nodes = []
for f in sorted(os.listdir(MEM)):
    if not f.endswith('.md') or f == 'MEMORY.md': continue
    t = open(os.path.join(MEM, f)).read()
    name = re.search(r'^name: (.+)$', t, re.M)
    desc = re.search(r'^description: (.+)$', t, re.M)
    nid = name.group(1) if name else f[:-3]
    nodes.append({'id': nid, 'desc': (desc.group(1) if desc else '')[:140],
                  'type': cat(nid), 'links': re.findall(r'\[\[([^\]]+)\]\]', t)})
tpl = open(os.path.join(os.path.dirname(__file__), 'template.html')).read()
out = tpl.replace('__DATA__', json.dumps(nodes))
open(os.path.join(os.path.dirname(__file__), 'index.html'), 'w').write(out)
print(f'{len(nodes)} memories -> index.html')
