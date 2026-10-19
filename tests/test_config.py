import pytest

from lucbot.config import SimulationConfig


@pytest.mark.parametrize(
    "change",
    [
        {"mode": "live"},
        {"mode": "paper"},
        {"cash": 0},
        {"cash": -1},
        {"cash": float("inf")},
        {"cash": True},
        {"commission": float("nan")},
        {"commission": -0.001},
        {"commission": 0.051},
        {"spread": -0.01},
        {"spread": 0.051},
        {"allocation": 0},
        {"allocation": 1},
        {"stop_loss": 0},
        {"stop_loss": 1},
        {"fast_period": 1},
        {"fast_period": True},
        {"fast_period": 2.5},
        {"fast_period": 30},
        {"slow_period": 5},
    ],
)
def test_rejects_invalid_configuration(change):
    with pytest.raises(ValueError):
        SimulationConfig(**change)


def test_simulation_is_the_only_mode():
    assert SimulationConfig().mode == "simulation"
