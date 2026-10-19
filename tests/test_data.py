import pandas as pd
import pytest

from lucbot.data import demo_data, export_demo, load_csv, validate_data


def test_demo_csv_round_trip(tmp_path):
    path = tmp_path / "demo.csv"
    export_demo(path)
    pd.testing.assert_frame_equal(demo_data(), load_csv(path), check_freq=False)
    with pytest.raises(FileExistsError):
        export_demo(path)


@pytest.mark.parametrize(
    "column,value",
    [
        ("Open", 0),
        ("Close", -1),
        ("High", float("nan")),
        ("Low", float("inf")),
        ("Volume", -1),
        ("High", 1),
        ("Low", 1000),
        ("High", "invalid"),
    ],
)
def test_rejects_bad_market_values(column, value):
    data = demo_data().astype(object)
    data.loc[data.index[5], column] = value
    with pytest.raises(ValueError):
        validate_data(data)


def test_rejects_unsorted_or_duplicate_dates():
    data = demo_data()
    with pytest.raises(ValueError, match="increasing"):
        validate_data(data.iloc[::-1])
    data.index = pd.DatetimeIndex([data.index[0]] * len(data))
    with pytest.raises(ValueError, match="unique"):
        validate_data(data)


@pytest.mark.parametrize("dates", ["bad-date", "", "2025-01-01"])
def test_rejects_invalid_or_duplicate_csv_dates(tmp_path, dates):
    path = tmp_path / "bad.csv"
    path.write_text(
        "timestamp,open,high,low,close,volume\n"
        f"{dates},100,101,99,100,1000\n"
        f"{dates},100,101,99,100,1000\n",
        encoding="utf-8",
    )
    with pytest.raises(ValueError):
        load_csv(path)


def test_rejects_missing_columns(tmp_path):
    path = tmp_path / "bad.csv"
    path.write_text("timestamp,close\n2025-01-01,100\n", encoding="utf-8")
    with pytest.raises(ValueError, match="CSV columns"):
        load_csv(path)
