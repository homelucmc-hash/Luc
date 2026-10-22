#!/usr/bin/env python3
"""Prépare une séquence complète en staging avant de remplacer la destination.

FFmpeg et ffprobe sont nécessaires dans l'environnement Codex. Cet outil valide
les fichiers, pas le photoréalisme, les droits ni le remplissage visible.
"""
import argparse
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile


DESKTOP = (1280, 720)
MOBILE = (800, 450)
FRAME_NAME = re.compile(r"frame-\d{4}\.webp\Z")


def positive_float(value):
    number = float(value)
    if not math.isfinite(number) or number <= 0:
        raise argparse.ArgumentTypeError("valeur positive et finie requise")
    return number


def arguments():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="MP4 source ; ne qualifie pas sa provenance")
    parser.add_argument("--start", type=float, default=0)
    parser.add_argument("--duration", type=positive_float, default=8)
    parser.add_argument("--frames", type=int, help="nombre exact, 120 à 9999 ; défaut : 160")
    parser.add_argument("--fps", type=positive_float,
                        help="compatibilité : déduit le nombre de frames de durée × cadence ; préférer --frames")
    parser.add_argument("--width", type=int, choices=[DESKTOP[0]], default=DESKTOP[0],
                        help="largeur desktop fixe du contrat actuel : 1280")
    parser.add_argument("--quality", type=int, default=82)
    parser.add_argument("--mobile-quality", type=int, default=80)
    parser.add_argument("--output", default="public/espresso-frames")
    parser.add_argument("--source-kind", choices=["unknown", "live-action", "cgi"], default="unknown",
                        help="déclaration de provenance ; aucune certification visuelle automatique")
    parser.add_argument("--source", help="description factuelle de la source pour le manifeste")
    parser.add_argument("--provenance", help="URL source, auteur ou référence de tournage")
    parser.add_argument("--license", dest="license_info", help="licence et/ou référence des droits")
    args = parser.parse_args()
    if not math.isfinite(args.start) or args.start < 0:
        parser.error("--start doit être positif ou nul et fini")
    if not 0 <= args.quality <= 100 or not 0 <= args.mobile_quality <= 100:
        parser.error("les qualités WebP doivent être comprises entre 0 et 100")
    if args.frames is not None and args.fps is not None:
        parser.error("choisir --frames ou l'ancien --fps, pas les deux")
    args.frames = args.frames if args.frames is not None else (
        round(args.duration * args.fps) if args.fps is not None else 160)
    if not 120 <= args.frames <= 9999:
        parser.error("le site et ses checks exigent 120 à 9999 frames par variante")
    return args


def execute(command):
    result = subprocess.run(command, check=False, capture_output=True, text=True)
    if result.returncode:
        raise ValueError(f"{Path(command[0]).name} a échoué : {result.stderr.strip()[-3000:]}")
    return result.stdout


def inspect_source(source, args):
    data = json.loads(execute([
        "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
        "stream=width,height,avg_frame_rate,r_frame_rate,duration,nb_frames:format=duration",
        "-of", "json", str(source),
    ]))
    streams = data.get("streams", [])
    if not streams or not streams[0].get("width") or not streams[0].get("height"):
        raise ValueError("la source n'a pas de piste vidéo exploitable")
    stream = streams[0]
    try:
        duration = float(stream.get("duration") or data["format"]["duration"])
        rate = Fraction(stream.get("avg_frame_rate", "0/1"))
        if rate <= 0:
            rate = Fraction(stream.get("r_frame_rate", "0/1"))
    except (KeyError, ValueError, ZeroDivisionError) as error:
        raise ValueError("durée/cadence de la piste vidéo indéterminée") from error
    if not math.isfinite(duration) or duration <= 0 or rate <= 0:
        raise ValueError("durée/cadence de la piste vidéo invalide")
    # No frozen tail is added to hide a source which ends before the useful clip.
    if args.start + args.duration > duration + 0.001:
        raise ValueError(f"extrait insuffisant : fin demandée {args.start + args.duration:g}s, vidéo {duration:g}s")
    target_rate = Fraction(args.frames) / Fraction(str(args.duration))
    if float(target_rate) > float(rate) + 0.001:
        raise ValueError(
            f"{args.frames} frames en {args.duration:g}s exigent {float(target_rate):g} i/s, "
            f"au-dessus des {float(rate):g} i/s annoncées par la source ; allonger l'extrait ou réduire --frames")
    return target_rate


def check_destination(output, source):
    if output.is_symlink():
        raise ValueError("la destination ne doit pas être un lien symbolique")
    resolved = output.resolve()
    if resolved == source or resolved in source.parents:
        raise ValueError("la destination contient la vidéo source ; remplacement refusé")
    if not output.exists():
        return
    if not output.is_dir():
        raise ValueError("la destination existe et n'est pas un dossier")
    entries = list(output.iterdir())
    if not entries:
        return
    # Avoid replacing an arbitrary project folder passed by mistake as --output.
    if not (output / "manifest.json").is_file():
        raise ValueError("destination non vide sans manifest.json : remplacement refusé")
    for entry in entries:
        if entry.is_symlink():
            raise ValueError(f"lien symbolique inattendu dans la destination : {entry.name}")
        if entry.name == "mobile" and entry.is_dir():
            if any(item.is_symlink() or not item.is_file() or not FRAME_NAME.fullmatch(item.name)
                   for item in entry.iterdir()):
                raise ValueError("le dossier mobile contient des fichiers étrangers à la séquence")
        elif not entry.is_file() or not (FRAME_NAME.fullmatch(entry.name) or entry.name in {
                "manifest.json", "poster.webp", "final.webp", "README.md"}):
            raise ValueError(f"fichier étranger à la séquence, conservé sans modification : {entry.name}")


def dimensions(path):
    """Read WebP dimensions without requiring a Python imaging dependency."""
    data = path.read_bytes()
    if len(data) < 30 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise ValueError(f"WebP invalide : {path.name}")
    if int.from_bytes(data[4:8], "little") + 8 != len(data):
        raise ValueError(f"WebP tronqué ou taille RIFF invalide : {path.name}")
    cursor = 12
    while cursor + 8 <= len(data):
        kind = data[cursor:cursor + 4]
        size = int.from_bytes(data[cursor + 4:cursor + 8], "little")
        chunk = data[cursor + 8:cursor + 8 + size]
        if len(chunk) != size:
            raise ValueError(f"chunk WebP tronqué : {path.name}")
        if kind == b"VP8 " and len(chunk) >= 10 and chunk[3:6] == b"\x9d\x01\x2a":
            return (int.from_bytes(chunk[6:8], "little") & 0x3fff,
                    int.from_bytes(chunk[8:10], "little") & 0x3fff)
        if kind == b"VP8L" and len(chunk) >= 5 and chunk[0] == 0x2f:
            bits = int.from_bytes(chunk[1:5], "little")
            return ((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1)
        if kind == b"VP8X" and len(chunk) >= 10:
            return (int.from_bytes(chunk[4:7], "little") + 1,
                    int.from_bytes(chunk[7:10], "little") + 1)
        cursor += 8 + size + (size % 2)
    raise ValueError(f"dimensions WebP introuvables : {path.name}")


def fit_filter(size):
    width, height = size
    # Preserve the source aspect ratio; do not crop away the stream or cup here.
    return (f"scale={width}:{height}:force_original_aspect_ratio=decrease:flags=lanczos,"
            f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=0x080605,setsar=1")


def convert(source, stage, args, rate):
    (stage / "mobile").mkdir()
    graph = (f"[0:v:0]fps=fps={rate.numerator}/{rate.denominator}:start_time=0:round=near,split=2[d][m];"
             f"[d]{fit_filter(DESKTOP)}[desktop];[m]{fit_filter(MOBILE)}[mobile]")
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
               "-ss", str(args.start), "-t", str(args.duration), "-i", str(source),
               "-filter_complex_threads", "1", "-filter_complex", graph]
    for label, folder, quality in [("desktop", stage, args.quality),
                                   ("mobile", stage / "mobile", args.mobile_quality)]:
        command += ["-map", f"[{label}]", "-an", "-sn", "-dn", "-frames:v", str(args.frames),
                    "-c:v", "libwebp", "-quality", str(quality), "-compression_level", "5",
                    "-threads", "2", "-fps_mode", "passthrough", "-start_number", "1",
                    str(folder / "frame-%04d.webp")]
    execute(command)
    for folder, size in [(stage, DESKTOP), (stage / "mobile", MOBILE)]:
        expected = [folder / f"frame-{i:04d}.webp" for i in range(1, args.frames + 1)]
        if sorted(folder.glob("frame-*.webp")) != expected:
            raise ValueError(f"séquence {folder.name} incomplète ; {args.frames} frames exactes attendues")
        for frame in expected:
            if dimensions(frame) != size:
                raise ValueError(f"dimensions incorrectes : {frame}")
        # A plausible RIFF header alone does not prove that every image decodes.
        execute(["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-xerror",
                 "-threads", "2", "-start_number", "1", "-i", str(folder / "frame-%04d.webp"),
                 "-frames:v", str(args.frames), "-f", "null", "-"])
    shutil.copyfile(stage / "frame-0001.webp", stage / "poster.webp")
    shutil.copyfile(stage / f"frame-{args.frames:04d}.webp", stage / "final.webp")
    digest = hashlib.sha256()
    with source.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    labels = {"unknown": "Source non qualifiée", "cgi": "Rendu de synthèse déclaré",
              "live-action": "Prise de vue réelle déclarée par l'importateur"}
    manifest = {
        "count": args.frames, "ext": "webp", "width": DESKTOP[0], "height": DESKTOP[1],
        "mobileWidth": MOBILE[0], "mobileHeight": MOBILE[1],
        "source": args.source or f"{labels[args.source_kind]} : {source.name}",
        "sourceKind": args.source_kind, "sourceFile": source.name,
        "sourceSha256": digest.hexdigest(), "start": args.start, "duration": args.duration,
        "fps": float(rate), "visualValidation": "not-performed-by-importer",
    }
    if args.provenance:
        manifest["provenance"] = args.provenance
    if args.license_info:
        manifest["license"] = args.license_info
    (stage / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (stage / "README.md").write_text(
        f"Séquence générée : {args.frames} frames desktop 1280×720 et mobile 800×450.\n"
        f"Source : {manifest['source']}\n"
        "Provenance déclarée dans manifest.json ; droits et remplissage visible à vérifier manuellement.\n"
        "Le succès de l'import ne certifie ni le photoréalisme ni la progression du liquide.\n", encoding="utf-8")


def install(stage, output, source):
    check_destination(output, source)
    backup = None
    if output.exists():
        backup = Path(tempfile.mkdtemp(prefix=f".{output.name}.previous-", dir=output.parent))
        backup.rmdir()
        output.rename(backup)
    try:
        stage.rename(output)
    except BaseException:
        if backup is not None:
            backup.rename(output)
        raise
    if backup is not None:
        try:
            shutil.rmtree(backup)
        except OSError:
            print(f"Avertissement : ancienne séquence conservée dans {backup}", file=sys.stderr)


def main():
    args = arguments()
    source = Path(args.input).expanduser().resolve()
    # These checks precede mkdir, staging, or any modification of the destination.
    if not source.is_file():
        raise ValueError(f"vidéo absente : {source}")
    for executable in ("ffmpeg", "ffprobe"):
        if not shutil.which(executable):
            raise ValueError(f"{executable} doit être installé dans l'environnement Codex")
    rate = inspect_source(source, args)
    output = Path(args.output).expanduser().absolute()
    check_destination(output, source)
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=f".{output.name}.staging-", dir=output.parent) as temporary:
        stage = Path(temporary)
        print(f"Préparation : {args.frames} frames × 2 résolutions, {float(rate):g} i/s ; destination inchangée pendant validation.", flush=True)
        convert(source, stage, args, rate)
        install(stage, output, source)
    total = sum(path.stat().st_size for path in output.rglob("*.webp"))
    print(f"OK structure : {args.frames * 2} frames + 2 posters, {total / 1024 / 1024:.2f} Mio ; {output}")
    print("Non réalisé par cet outil : revue des droits, photoréalisme, niveau qui monte et tests de scroll aller/retour.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError) as error:
        sys.exit(f"ÉCHEC : {error}")
