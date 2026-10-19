import json
import socket

import pandas as pd
import pytest

from lucbot.config import SimulationConfig
from lucbot.data import demo_data
from lucbot.simulation import run_simulation


def no_network(*args, **kwargs):
    raise AssertionError("Simulation attempted a network connection.")


@pytest.fixture(autouse=True)
def forbid_network(monkeypatch):
    monkeypatch.setattr(socket.socket, "connect", no_network)
    monkeypatch.setattr(socket.socket, "connect_ex", no_network)
    monkeypatch.setattr(socket, "create_connection", no_network)
    monkeypatch.setattr(socket, "getaddrinfo", no_network)


def test_full_simulation_has_trades_fees_and_reconciled_cash():
    config = SimulationConfig()
    result = run_simulation(demo_data(), config, source="synthetic_demo")
    assert result.summary["mode"] == "simulation"
    assert result.summary["source"] == "synthetic_demo"
    assert result.summary["trade_count"] == len(result.trades) > 0
    assert (result.trades["Size"] > 0).all()
    assert result.trades["Commission"].sum() > 0
    assert result.summary["final_equity"] == pytest.approx(config.cash + result.trades["PnL"].sum())
    assert result.equity.iloc[-1]["equity"] == pytest.approx(result.summary["final_equity"])
    assert (result.equity["equity"] >= 0).all()


def test_stop_exits_a_losing_trade_at_next_bar_execution():
    closes = [10, 9, 8, 7, 6, 7, 8, 9, 4, 4, 4, 4, 4]
    opens = [closes[0], *closes[:-1]]
    data = pd.DataFrame(
        {
            "Open": opens,
            "High": [max(op, cl) * 1.001 for op, cl in zip(opens, closes, strict=True)],
            "Low": [min(op, cl) * 0.999 for op, cl in zip(opens, closes, strict=True)],
            "Close": closes,
            "Volume": 1000,
        },
        index=pd.date_range("2025-01-01", periods=len(closes), tz="UTC"),
    )
    result = run_simulation(data, SimulationConfig(fast_period=2, slow_period=3, commission=0, spread=0))
    first = result.trades.iloc[0]
    # The cross is at bar 6; entry must wait until bar 7 and use its open.
    assert first["EntryBar"] == 7
    assert first["EntryPrice"] == 8
    assert first["ExitBar"] == 8
    assert first["ExitPrice"] == pytest.approx(7.6)
    assert first["PnL"] < 0


def test_future_prices_do_not_change_prior_equity():
    original = demo_data()
    changed = original.copy()
    changed.loc[changed.index[180]:, ["Open", "High", "Low", "Close"]] *= 1.5
    before = run_simulation(original, SimulationConfig())
    after = run_simulation(changed, SimulationConfig())
    pd.testing.assert_frame_equal(before.equity.iloc[:180], after.equity.iloc[:180])


def test_flat_market_has_no_trades_and_valid_json(tmp_path):
    data = demo_data()
    data.loc[:, ["Open", "High", "Low", "Close"]] = 100.0
    result = run_simulation(data, SimulationConfig())
    result.write_reports(tmp_path / "flat")
    summary = json.loads((tmp_path / "flat" / "summary.json").read_text())
    assert summary["trade_count"] == 0
    assert summary["win_rate_pct"] is None
    assert summary["final_equity"] == summary["initial_cash"]
    assert len(pd.read_csv(tmp_path / "flat" / "equity.csv")) == len(data)
    assert pd.read_csv(tmp_path / "flat" / "trades.csv").empty


def test_repeatability_and_no_report_overwrite(tmp_path):
    first = run_simulation(demo_data(), SimulationConfig())
    second = run_simulation(demo_data(), SimulationConfig())
    assert first.summary == second.summary
    pd.testing.assert_frame_equal(first.trades, second.trades)
    output = tmp_path / "run"
    first.write_reports(output)
    with pytest.raises(FileExistsError):
        second.write_reports(output)
    assert json.loads((output / "summary.json").read_text()) == first.summary


def test_rejects_too_little_history():
    with pytest.raises(ValueError, match="32 bars"):
        run_simulation(demo_data(31), SimulationConfig())


def test_last_bar_signal_cannot_open_an_unreportable_position():
    closes = [10, 9, 8, 7, 6, 7, 8]
    opens = [closes[0], *closes[:-1]]
    data = pd.DataFrame(
        {
            "Open": opens,
            "High": [max(op, cl) + 1 for op, cl in zip(opens, closes, strict=True)],
            "Low": [min(op, cl) - 1 for op, cl in zip(opens, closes, strict=True)],
            "Close": closes,
            "Volume": 1000,
        },
        index=pd.date_range("2025-01-01", periods=len(closes), tz="UTC"),
    )
    result = run_simulation(data, SimulationConfig(fast_period=2, slow_period=3))
    assert result.summary["trade_count"] == 0
    assert result.summary["final_equity"] == result.summary["initial_cash"]
