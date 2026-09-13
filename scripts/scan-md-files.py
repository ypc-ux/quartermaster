#!/usr/bin/env python3
import os, json
from datetime import datetime

workspace = '/Users/thefuckingman/.cline/data/workspaces/chat'
repos = ['quartermaster','quartermaster-agents','payscope','agency-os','priming-for-code',
  'client-qr','rizzscript-landing','social-ops','switchboard-repo','ops','studio-master',
  'studio-ideas','personal-brand','learn','agency-skills','ypc-ux-audit','ypc-ux-handoff',
  'ypc-smooth-operator','InterchangeAI','SideQuest','SubledgerAI','TerminalShield','Recordly']

skip = {'.git','node_modules','.next','.vercel','.priming'}

def categorize(name):
    n = name.lower()
    if any(k in n for k in ['task_status','handoff','status','deploy']): return 'STATUS'
    if any(k in n for k in ['thesis','money','protocol','challenge','submission','score']): return 'KEY_ASSET'
    if any(k in n for k in ['agent','skill','brainwash','stunt','hook','content','outreach','ad-creative']): return 'AGENT'
    if any(k in n for k in ['plan','spec','arch','design','blueprint']): return 'SPEC'
    if any(k in n for k in ['readme','setup','install','guide','how-to']): return 'DOCS'
    return 'OTHER'

files = []
for repo in repos:
    rp = os.path.join(workspace, repo)
    if not os.path.isdir(rp): continue
    for root, dirs, fnames in os.walk(rp):
        dirs[:] = [d for d in dirs if d not in skip]
        for f in fnames:
            if not f.endswith('.md'): continue
            full = os.path.join(root, f)
            rel = os.path.relpath(full, workspace)
            try:
                st = os.stat(full)
                files.append({'repo':repo,'path':rel,'name':f,'cat':categorize(f),
                    'size':st.st_size,'modified':datetime.fromtimestamp(st.st_mtime).strftime('%Y-%m-%d')})
            except: pass

for f in os.listdir(workspace):
    if f.endswith('.md') and os.path.isfile(os.path.join(workspace, f)):
        try:
            st = os.stat(os.path.join(workspace, f))
            files.append({'repo':'(root)','path':f,'name':f,'cat':categorize(f),
                'size':st.st_size,'modified':datetime.fromtimestamp(st.st_mtime).strftime('%Y-%m-%d')})
        except: pass

with open('/tmp/md_inventory.json','w') as out:
    json.dump(files, out)
print(f'Total: {len(files)} files across {len(set(f["repo"] for f in files))} repos')
cats = {}
for f in files: cats[f['cat']] = cats.get(f['cat'],0)+1
for c,n in sorted(cats.items(), key=lambda x:-x[1]):
    print(f'  {c}: {n}')
