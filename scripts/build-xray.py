#!/usr/bin/env python3
import json, os
from datetime import datetime

w = '/Users/thefuckingman/.cline/data/workspaces/chat'
with open('/tmp/md_inventory.json') as f:
    files = json.load(f)

cc = {'STATUS':'#10b981','KEY_ASSET':'#c9a227','AGENT':'#8b5cf6','SPEC':'#3b82f6','DOCS':'#6b7280','OTHER':'#374151'}
repos = sorted(set(fi['repo'] for fi in files))
cats = {}
for fi in files:
    cats[fi['cat']] = cats.get(fi['cat'], 0) + 1

rows = []
for fi in sorted(files, key=lambda x: (x['repo'], x['path'])):
    c = cc.get(fi['cat'], '#374151')
    rows.append('<tr class="fr" data-cat="'+fi['cat']+'" data-repo="'+fi['repo']+'">'
        '<td><span class="b" style="background:'+c+'">'+fi['cat']+'</span></td>'
        '<td class="r">'+fi['repo']+'</td><td class="p">'+fi['path']+'</td>'
        '<td>'+fi['modified']+'</td><td>'+str(fi['size']//1024)+'K</td></tr>')

repo_opts = ''.join('<option value="'+r+'">'+r+'</option>' for r in repos)
stats = ''.join('<div class="st"><div class="v" style="color:'+cc[c]+'">'+str(n)+'</div><div class="l">'+c+'</div></div>' for c,n in sorted(cats.items(), key=lambda x:-x[1]))
now = datetime.now().strftime('%Y-%m-%d %H:%M')

tpl_path = os.path.join(w, 'quartermaster/public/xray-template.html')
out_path = os.path.join(w, 'quartermaster/public/xray.html')
with open(tpl_path) as f:
    html = f.read()

html = html.replace('<!--TOTAL-->', str(len(files)))
html = html.replace('<!--REPO_COUNT-->', str(len(repos)))
html = html.replace('<!--NOW-->', now)
html = html.replace('<!--STATS-->', stats)
html = html.replace('<!--REPO_OPTS-->', repo_opts)
html = html.replace('<!--ROWS-->', ''.join(rows))

with open(out_path, 'w') as f:
    f.write(html)
print('Built: '+str(len(html))+' bytes, '+str(len(files))+' files')
print('Output: '+out_path)
