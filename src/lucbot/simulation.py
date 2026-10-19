"""SMA signals executed by backtesting.py's virtual, unleveraged broker."""

from dataclasses import asdict, dataclass
from hashlib import sha256
import json
from math import isfinite
from pathlib import Path

from backtesting import Backtest, Strategy
from backtesting.lib import crossover
import pandas as pd

from lucbot.config import SimulationConfig
from lucbot.data import validate_data


def moving_average(values, period: int):
    return pd.Series(values).rolling(period).mean().to_numpy()


class SmaCross(Strategy):
    fast_period = 10
    slow_period = 30
    allocation = 0.25
    stop_loss = 0.05

    def init(self) -> None:
        self._total_bars = len(self.data)
        self.fast = self.I(moving_average, self.data.Close, self.fast_period, name="fast_sma")
        self.slow = self.I(moving_average, self.data.Close, self.slow_period, name="slow_sma")

    def next(self) -> None:
        # There is no next open for a last-bar signal; do not queue an order.
        if len(self.data) == self._total_bars:
            return
        if self.position:
            if crossover(self.slow, self.fast):
                self.position.close()
        elif crossover(self.fast, self.slow):
            self.buy(size=self.allocation, sl=float(self.data.Close[-1]) * (1 - self.stop_loss))


@dataclass
class SimulationResult:
    summary: dict
    equity: pd.DataFrame
    trades: pd.DataFrame

    def write_reports(self, output: Path) -> None:
        output.mkdir(parents=True, exist_ok=False)
        self.equity.to_csv(output / "equity.csv", index_label="timestamp")
        self.trades.to_csv(output / "trades.csv", index=False)
        # Write the summary last, so it also marks a completed report bundle.
        with (output / "summary.json").open("x", encoding="utf-8") as stream:
            json.dump(self.summary, stream, indent=2, allow_nan=False)
            stream.write("\n")


def run_simulation(
    data: pd.DataFrame,
    config: SimulationConfig,
    *,
    source: str = "local_csv",
) -> SimulationResult:
    data = validate_data(data, minimum_bars=config.slow_period + 2)
    engine = Backtest(
        data,
        SmaCross,
        cash=config.cash,
        commission=config.commission,
        spread=config.spread,
        margin=1.0,
        trade_on_close=False,
        hedging=False,
        exclusive_orders=True,
        finalize_trades=True,
    )
    stats = engine.run(
        fast_period=config.fast_period,
        slow_period=config.slow_period,
        allocation=config.allocation,
        stop_loss=config.stop_loss,
    )
    final_equity = float(stats["Equity Final [$]"])
    win_rate = float(stats["Win Rate [%]"])
    summary = {
        "schema_version": 1,
        "mode": "simulation",
        "broker": "backtesting.py virtual broker",
        "source": source,
        "data_sha256": sha256(data.to_csv().encode("utf-8")).hexdigest(),
        "bars": len(data),
        "start": data.index[0].isoformat(),
        "end": data.index[-1].isoformat(),
        "config": asdict(config),
        "initial_cash": config.cash,
        "final_equity": final_equity,
        "net_profit": final_equity - config.cash,
        "return_pct": float(stats["Return [%]"]),
        "max_drawdown_pct": abs(float(stats["Max. Drawdown [%]"])),
        "trade_count": int(stats["# Trades"]),
        "win_rate_pct": win_rate if isfinite(win_rate) else None,
    }
    equity = stats["_equity_curve"][["Equity", "DrawdownPct"]].rename(
        columns={"Equity": "equity", "DrawdownPct": "drawdown_pct"}
    )
    equity["drawdown_pct"] *= 100
    return SimulationResult(summary, equity, stats["_trades"].copy())
