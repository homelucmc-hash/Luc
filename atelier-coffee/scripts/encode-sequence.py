"""Denoise original Blender PNGs and encode the two local WebP sequence sizes.

Requires FFmpeg and Intel Open Image Denoise's oidnDenoise CLI (Apache-2.0).
Example: python scripts/encode-sequence.py --oidn /path/to/oidnDenoise
Use --watch while Blender renders; every image is validated before conversion.
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--input', type=Path, default=ROOT / 'production/renders')
parser.add_argument('--output', type=Path, default=ROOT / 'public/espresso-frames')
parser.add_argument('--oidn', default=os.environ.get('OIDN_BIN', shutil.which('oidnDenoise')))
parser.add_argument('--watch', action='store_true')
parser.add_argument('--frames', default='all')
parser.add_argument('--skip-denoise', action='store_true')
parser.add_argument('--force', action='store_true', help='Re-encode already current output files.')
args = parser.parse_args()
if not args.skip_denoise and not args.oidn:
    parser.error('Provide --oidn /path/to/oidnDenoise or set OIDN_BIN.')
frames = list(range(160)) if args.frames == 'all' else [int(value) for value in args.frames.split(',')]
args.output.mkdir(parents=True, exist_ok=True)
(args.output / 'mobile').mkdir(parents=True, exist_ok=True)

def destination(index, variant):
    folder = args.output if variant == 'desktop' else args.output / 'mobile'
    return folder / f'frame-{index + 1:04}.webp'

def run(command):
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr[-2000:] or result.stdout[-2000:])

def encode(index):
    source = args.input / f'frame-{index:03}.png'
    with tempfile.TemporaryDirectory(prefix='atelier-encode-') as folder:
        work = Path(folder)
        if args.skip_denoise:
            clean = source
        else:
            noisy = work / 'noisy.pfm'
            clean = work / 'clean.pfm'
            run(['ffmpeg', '-v', 'error', '-y', '-threads', '1', '-i', str(source), '-pix_fmt', 'gbrpf32le', str(noisy)])
            # PNGs are already AgX display-referred sRGB, so use the LDR/sRGB filter.
            run([args.oidn, '--ldr', str(noisy), '--srgb', '--threads', '3', '-o', str(clean), '-v', '0'])
        for variant, width, quality in [('desktop', 1280, 86), ('mobile', 800, 82)]:
            output = destination(index, variant)
            temporary = work / f'{variant}.webp'
            run(['ffmpeg', '-v', 'error', '-y', '-threads', '1', '-i', str(clean), '-vf', f'scale={width}:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', str(quality), '-compression_level', '5', str(temporary)])
            staged = output.with_suffix('.webp.tmp')
            shutil.copy2(temporary, staged)
            staged.replace(output)
        if index == 0:
            shutil.copy2(destination(0, 'desktop'), args.output / 'poster.webp')
        if index == 159:
            shutil.copy2(destination(159, 'desktop'), args.output / 'final.webp')

pending = set(frames)
failures = {}
while pending:
    progressed = False
    for index in sorted(pending):
        source = args.input / f'frame-{index:03}.png'
        if not source.exists():
            continue
        # Renderers can create the path before finishing its write.
        if time.time() - source.stat().st_mtime < .5:
            continue
        if not args.force and all(destination(index, variant).exists() and destination(index, variant).stat().st_mtime >= source.stat().st_mtime for variant in ('desktop', 'mobile')):
            pending.remove(index)
            print(f'Already encoded {index:03} — {len(frames) - len(pending)}/{len(frames)}', flush=True)
            continue
        try:
            encode(index)
        except RuntimeError as error:
            failures[index] = str(error)
            if not args.watch:
                raise
            continue
        pending.remove(index)
        progressed = True
        print(f'Encoded {index:03} — {len(frames) - len(pending)}/{len(frames)}', flush=True)
    if pending and not args.watch:
        raise RuntimeError(f'Missing frames: {sorted(pending)}')
    if pending and not progressed:
        time.sleep(.5)

manifest = {
    'frames': 160, 'format': 'webp', 'desktopWidth': 1280, 'mobileWidth': 800,
    'denoiser': 'none' if args.skip_denoise else 'Intel Open Image Denoise 2.3.3, RT LDR sRGB',
    'encoding': 'FFmpeg libwebp, quality86 desktop /82 mobile',
    'sizes': {variant: sum(destination(index, variant).stat().st_size for index in frames) for variant in ('desktop', 'mobile')},
}
if args.frames == 'all':
    (ROOT / 'production/encoding.json').write_text(json.dumps(manifest, indent=2))
    (args.output / 'manifest.json').write_text(json.dumps({'count': 160, 'ext': 'webp', 'width': 1280, 'height': 720, 'mobileWidth': 800, 'source': 'Original continuous Blender Cycles espresso render'}, indent=2) + '\n')
print('Sequence encoding complete.', flush=True)
