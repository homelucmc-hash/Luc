# Project Instructions

This is a simulation-only trading bot. Never place real trades, add live broker
execution, request exchange credentials, or enable leverage/short selling.
Use the existing checkout; cloud tasks are already isolated. Do not create a Git
worktree unless explicitly requested by the user.

Python 3.12, uv, src layout. Install with `uv sync --frozen`, test with
`uv run --frozen pytest`, and smoke-test with `uv run --frozen lucbot simulate`.
Simulation requires no network, secrets, service or persistent background process.
Use backtesting.py for virtual order execution; do not invent a matching engine.
Keep runtime outputs in ignored `runs/`. Preserve existing output directories.
