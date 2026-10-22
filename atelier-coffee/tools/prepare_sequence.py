#!/usr/bin/env python3
"""Découpe un SEUL extrait vidéo en frames WebP + manifest.json. Nécessite FFmpeg.
Ex.: python tools/prepare_sequence.py --input assets/espresso-source.mp4 --start 2.5 --duration 7 --fps 24 --width 1600
"""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys

parser = argparse.ArgumentParser()
parser.add_argument('--input', required=True)
parser.add_argument('--start', type=float, default=0)
parser.add_argument('--duration', type=float, default=8)
parser.add_argument('--fps', type=int, default=24)
parser.add_argument('--width', type=int, default=1600)
parser.add_argument('--quality', type=int, default=78)
parser.add_argument('--output', default='public/espresso-frames')
a = parser.parse_args()

source = Path(a.input)
if not source.is_file():
    sys.exit(f'Vidéo absente : {source}')
if not shutil.which('ffmpeg'):
    sys.exit('FFmpeg doit être installé et accessible dans le PATH.')
if a.start < 0 or a.duration <= 0 or a.fps <= 0 or a.width < 320:
    sys.exit('Paramètres invalides.')

out = Path(a.output)
out.mkdir(parents=True, exist_ok=True)
for old in out.glob('frame-*.webp'):
    old.unlink()
manifest = out / 'manifest.json'
if manifest.exists():
    manifest.unlink()

cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(a.start), '-t', str(a.duration), '-i', str(source),
       '-vf', f'fps={a.fps},scale={a.width}:-2:flags=lanczos', '-an', '-c:v', 'libwebp',
       '-quality', str(a.quality), '-compression_level', '5', '-start_number', '1',
       str(out / 'frame-%04d.webp')]
print('Commande FFmpeg :', ' '.join(cmd))
subprocess.run(cmd, check=True)
frames = sorted(out.glob('frame-*.webp'))
if len(frames) < 120:
    sys.exit(f'ATTENTION : {len(frames)} frames seulement ; choisir un extrait >= 120 frames. Le manifeste n\'a pas été créé.')
if len(frames) > 9999:
    sys.exit('Trop de frames pour un index sur quatre chiffres.')
manifest.write_text(json.dumps({'count': len(frames), 'ext': 'webp'}, indent=2), encoding='utf-8')
total = sum(p.stat().st_size for p in frames)
print(f'OK : {len(frames)} images, poids total {total/1024/1024:.2f} Mo, manifest écrit : {manifest}')
print('Prochaine étape : ouvrir une fois les images 1, 25%, 50%, 75%, 100% pour vérifier la continuité et le remplissage.')
