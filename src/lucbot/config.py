"""Validated settings for the offline simulation."""

from dataclasses import dataclass
from math import isfinite


@dataclass(frozen=True, slots=True)
class SimulationConfig:
    mode: str = "simulation"
    cash: float = 10_000.0
    commission: float = 0.001
    spread: float = 0.0005
    fast_period: int = 10
    slow_period: int = 30
    allocation: float = 0.25
    stop_loss: float = 0.05

    def __post_init__(self) -> None:
        if self.mode != "simulation":
            raise ValueError("Only simulation mode is supported; real trading is unavailable.")
        for name in ("cash", "commission", "spread", "allocation", "stop_loss"):
            value = getattr(self, name)
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not isfinite(value):
                raise ValueError(f"{name} must be a finite number.")
        if self.cash <= 0:
            raise ValueError("cash must be positive.")
        if not 0 <= self.commission <= 0.05:
            raise ValueError("commission must be between 0 and 0.05.")
        if not 0 <= self.spread <= 0.05:
            raise ValueError("spread must be between 0 and 0.05.")
        if not 0 < self.allocation <= 0.95:
            raise ValueError("allocation must be greater than 0 and at most 0.95.")
        if not 0 < self.stop_loss < 1:
            raise ValueError("stop_loss must be greater than 0 and less than 1.")
        for name in ("fast_period", "slow_period"):
            value = getattr(self, name)
            if isinstance(value, bool) or not isinstance(value, int) or value < 2:
                raise ValueError(f"{name} must be an integer of at least 2.")
        if self.fast_period >= self.slow_period:
            raise ValueError("fast_period must be smaller than slow_period.")
