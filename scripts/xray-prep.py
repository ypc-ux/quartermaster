#!/usr/bin/env python3
import json, os
from datetime import datetime

workspace = '/Users/thefuckingman/.cline/data/workspaces/chat'
with open('/tmp/md_inventory.json') as f:
    files = json.load(f)

cat_colors = {'STATUS':'#10b981','KEY_ASSET':'#c9a227','AGENT':'#8b5cf6','SPEC':'#3b82f6','DOCS':'#6b7280','OTHER':'#374151'}
repos = sorted(set(fi['repo'] for fi in files))
cats = {}
for fi in files: cats[fi['cat']] = cats.get(fi['cat'], 0) + 1

rows = []
for fi in sorted(files, key=lambda x: (x['repo'], x['path'])):
    color = cat_colors.get(fi['cat'], '#374151')
    rows.append(f'<tr class="fr" data-cat="{fi["cat"]}" data-repo="{fi["repo"]}"><td><span class="b" style="background:{color}">{fi["cat"]}</span></td><td class="r">{fi["repo"]}</td><td class="p">{fi["path"]}</td><td>{fi["modified"]}</td><td>{fi["size"]/1024:.1f}K</td></tr>')

repo_opts = ''.join(f'<option value="{r}">{r}</option>' for r in repos)
stats = ''.join(f'<div class="st"><div class="v" style="color:{cat_colors[c]}">{n}</div><div class="l">{c}</div></div>' for c,n in sorted(cats.items(), key=lambda x:-x[1]))
now = datetime.now().strftime('%Y-%m-%d %H:%M')

with open('/tmp/xray_template.json', 'w') as out:
    json.dump({'rows': ''.join(rows), 'repo_opts': repo_opts, 'stats': stats,
               'total': len(files), 'repo_count': len(repos), 'now': now}, out)
print(f'Prepared: {len(files)} files, {len(repos)} repos')
