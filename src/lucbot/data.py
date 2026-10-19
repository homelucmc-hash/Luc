"""Local OHLCV data and a deterministic, explicitly synthetic demo market."""

from math import isfinite, sin
from pathlib import Path

import pandas as pd

PRICE_COLUMNS = ["Open", "High", "Low", "Close"]
MARKET_COLUMNS = [*PRICE_COLUMNS, "Volume"]
CSV_COLUMNS = ["timestamp", "open", "high", "low", "close", "volume"]


def validate_data(data: pd.DataFrame, minimum_bars: int = 2) -> pd.DataFrame:
    if not isinstance(data.index, pd.DatetimeIndex):
        raise ValueError("Market data must have a datetime index.")
    if data.index.hasnans or data.index.has_duplicates or not data.index.is_monotonic_increasing:
        raise ValueError("Timestamps must be valid, unique and in increasing order.")
    if len(data) < minimum_bars:
        raise ValueError(f"At least {minimum_bars} bars are required.")
    if not set(MARKET_COLUMNS).issubset(data.columns) or data.columns.has_duplicates:
        raise ValueError("Market data must contain unique Open, High, Low, Close and Volume columns.")
    try:
        clean = data[MARKET_COLUMNS].apply(pd.to_numeric, errors="raise").astype(float)
    except (ValueError, TypeError) as exc:
        raise ValueError("OHLCV values must be numbers.") from exc
    if not clean.map(isfinite).all().all():
        raise ValueError("OHLCV values must be finite; missing values are not allowed.")
    if (clean[PRICE_COLUMNS] <= 0).any().any() or (clean["Volume"] < 0).any():
        raise ValueError("Prices must be positive and volume cannot be negative.")
    if (
        (clean["High"] < clean[["Open", "Close", "Low"]].max(axis=1)).any()
        or (clean["Low"] > clean[["Open", "Close", "High"]].min(axis=1)).any()
    ):
        raise ValueError("Invalid OHLC range: low <= open/close <= high is required.")
    clean.index = clean.index.tz_localize("UTC") if clean.index.tz is None else clean.index.tz_convert("UTC")
    clean.index.name = "timestamp"
    return clean


def load_csv(path: Path) -> pd.DataFrame:
    # Pass a local file handle so pandas cannot interpret the input as a URL.
    with path.open("r", encoding="utf-8", newline="") as stream:
        frame = pd.read_csv(stream)
    if not set(CSV_COLUMNS).issubset(frame.columns):
        raise ValueError(f"CSV columns required: {', '.join(CSV_COLUMNS)}.")
    try:
        timestamps = pd.to_datetime(frame["timestamp"].astype(str), format="ISO8601", utc=True)
    except (ValueError, TypeError) as exc:
        raise ValueError("CSV timestamps must use ISO 8601 dates or datetimes.") from exc
    data = frame[[name.lower() for name in MARKET_COLUMNS]].copy()
    data.columns = MARKET_COLUMNS
    data.index = pd.DatetimeIndex(timestamps)
    return validate_data(data)


def demo_data(bars: int = 240) -> pd.DataFrame:
    if isinstance(bars, bool) or not isinstance(bars, int) or bars < 2:
        raise ValueError("bars must be an integer of at least 2.")
    closes = [100 + 0.04 * i + 12 * sin(i / 9) + 3 * sin(i / 2.7) for i in range(bars)]
    opens = [closes[0], *closes[:-1]]
    data = pd.DataFrame(
        {
            "Open": opens,
            "High": [max(op, cl) * 1.007 for op, cl in zip(opens, closes, strict=True)],
            "Low": [min(op, cl) * 0.993 for op, cl in zip(opens, closes, strict=True)],
            "Close": closes,
            "Volume": [1000 + (i % 17) * 25 for i in range(bars)],
        },
        index=pd.date_range("2025-01-01", periods=bars, freq="D", tz="UTC"),
    )
    return validate_data(data)


def export_demo(path: Path) -> None:
    data = demo_data().rename(columns=str.lower)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("x", encoding="utf-8", newline="") as stream:
        data.to_csv(stream, index_label="timestamp")
