"""Bounded offline runs; there is intentionally no live execution command."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import sys

from lucbot import __version__
from lucbot.config import SimulationConfig
from lucbot.data import demo_data, export_demo, load_csv
from lucbot.simulation import run_simulation


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(prog="lucbot", description="Bot de trading en simulation hors ligne.")
    result.add_argument("--version", action="version", version=f"lucbot {__version__}")
    commands = result.add_subparsers(dest="command", required=True)
    demo = commands.add_parser("demo-data", help="Exporter les cours synthetiques de demonstration.")
    demo.add_argument("--output", type=Path, required=True)
    simulate = commands.add_parser("simulate", help="Simuler sur la demo ou sur un CSV local.")
    simulate.add_argument("--csv", type=Path, help="CSV OHLCV local ; sinon, donnees synthetiques.")
    simulate.add_argument("--output", type=Path, help="Nouveau dossier de rapports ; defaut : runs/<date UTC>.")
    simulate.add_argument("--cash", type=float, default=10_000.0)
    simulate.add_argument("--commission", type=float, default=0.001)
    simulate.add_argument("--spread", type=float, default=0.0005)
    simulate.add_argument("--fast", type=int, default=10)
    simulate.add_argument("--slow", type=int, default=30)
    simulate.add_argument("--allocation", type=float, default=0.25)
    simulate.add_argument("--stop-loss", type=float, default=0.05)
    return result


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        if args.command == "demo-data":
            export_demo(args.output)
            print(f"Donnees synthetiques : {args.output}")
            return 0
        config = SimulationConfig(
            cash=args.cash,
            commission=args.commission,
            spread=args.spread,
            fast_period=args.fast,
            slow_period=args.slow,
            allocation=args.allocation,
            stop_loss=args.stop_loss,
        )
        data = demo_data() if args.csv is None else load_csv(args.csv)
        result = run_simulation(data, config, source="synthetic_demo" if args.csv is None else "local_csv")
        output = args.output or Path("runs") / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")
        result.write_reports(output)
    except (ValueError, OSError) as exc:
        print(f"Erreur : {exc}", file=sys.stderr)
        return 2
    print("SIMULATION HORS LIGNE - aucune transaction reelle")
    print(json.dumps(result.summary, indent=2, allow_nan=False))
    print(f"Rapports : {output}")
    return 0
