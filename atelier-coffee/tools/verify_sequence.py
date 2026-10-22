#!/usr/bin/env python3
"""Validation structurelle des assets ; NE certifie PAS visuellement le versement.
Ex.: python tools/verify_sequence.py
"""
from pathlib import Path
import json
import sys

out = Path('public/espresso-frames')
manifest = out/'manifest.json'
if not manifest.exists():
    sys.exit('ECHEC : manifest.json absent. Aucune séquence vidéo prête.')
info = json.loads(manifest.read_text(encoding='utf-8'))
count = info.get('count', 0)
ext = info.get('ext', 'webp')
if not isinstance(count, int) or count < 120:
    sys.exit(f'ECHEC : {count} frames, minimum 120 demandé.')
files = [out/f'frame-{i:04d}.{ext}' for i in range(1,count+1)]
missing = [p.name for p in files if not p.exists() or p.stat().st_size==0]
if missing:
    sys.exit(f'ECHEC : {len(missing)} frames absentes : {missing[:15]}')
size = sum(p.stat().st_size for p in files)
print(f'OK structure : {count} frames, {size/1024/1024:.2f} Mo. Inspection visuelle obligatoire.')
print('Frames clés :', ', '.join(files[round((count-1)*p)].name for p in (0,.25,.5,.75,1)))
