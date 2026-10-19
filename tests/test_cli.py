import json
import socket

import pytest

from lucbot.cli import main


def test_installed_cli_demo_and_csv_workflow(tmp_path, capsys, monkeypatch):
    def reject_connection(*args, **kwargs):
        raise AssertionError("CLI attempted a network connection.")

    monkeypatch.setattr(socket.socket, "connect", reject_connection)
    monkeypatch.setenv("TRADING_MODE", "live")
    demo = tmp_path / "demo.csv"
    output = tmp_path / "simulation"
    assert main(["demo-data", "--output", str(demo)]) == 0
    assert main(["simulate", "--csv", str(demo), "--output", str(output)]) == 0
    summary = json.loads((output / "summary.json").read_text())
    assert summary["mode"] == "simulation"
    assert summary["trade_count"] > 0
    assert "SIMULATION HORS LIGNE" in capsys.readouterr().out
    assert main(["simulate", "--output", str(output)]) == 2
    assert "Erreur" in capsys.readouterr().err


@pytest.mark.parametrize("args", [["live"], ["simulate", "--mode", "live"], ["simulate", "--live"]])
def test_live_commands_do_not_exist(args):
    with pytest.raises(SystemExit) as failure:
        main(args)
    assert failure.value.code == 2


@pytest.mark.parametrize(
    "args", [["--cash", "nan"], ["--cash", "-1"], ["--fast", "30"], ["--allocation", "1"]]
)
def test_invalid_cli_parameters_fail_without_output(tmp_path, capsys, args):
    output = tmp_path / "invalid"
    assert main(["simulate", "--output", str(output), *args]) == 2
    assert not output.exists()
    assert "Erreur" in capsys.readouterr().err


def test_missing_or_remote_input_is_rejected(tmp_path, capsys):
    output = tmp_path / "invalid"
    assert main(["simulate", "--csv", "https://example.com/prices.csv", "--output", str(output)]) == 2
    assert not output.exists()
    assert "Erreur" in capsys.readouterr().err
