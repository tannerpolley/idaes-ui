import pytest

from idaes_ui.fv import errors
from idaes_ui.fv.model_server import FlowsheetServer


VALID_TRACE = {
    "version": 1,
    "events": [
        {
            "step_id": "solve",
            "label": "Solve",
            "status": "running",
            "unit_ids": ["H101"],
            "stream_ids": ["s01"],
            "duration_ms": 100,
        }
    ],
}


def test_server_registers_and_returns_trace():
    server = FlowsheetServer()
    try:
        server.add_trace("demo", VALID_TRACE)

        trace = server.get_trace("demo")

        assert trace["events"][0]["step_id"] == "solve"
    finally:
        server.server_close()


def test_server_rejects_malformed_trace():
    server = FlowsheetServer()
    try:
        with pytest.raises(errors.ProcessingError, match="run trace"):
            server.add_trace("demo", {"version": 1, "events": []})
    finally:
        server.server_close()


def test_server_reports_missing_trace():
    server = FlowsheetServer()
    try:
        with pytest.raises(errors.ProcessingError, match="No trace registered"):
            server.get_trace("demo")
    finally:
        server.server_close()
