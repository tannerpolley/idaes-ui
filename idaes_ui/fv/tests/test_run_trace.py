import pytest

from idaes_ui.fv.run_trace import RunTraceValidationError, normalize_run_trace


def test_normalize_run_trace_accepts_valid_payload():
    payload = {
        "version": 1,
        "events": [
            {
                "step_id": "load-feed",
                "label": "Load feed",
                "status": "running",
                "unit_ids": ["feed"],
                "stream_ids": ["s01"],
                "duration_ms": 750,
                "message": "Feed state loaded.",
                "values": [{"label": "Li", "value": 168.0, "units": "mg/L"}],
            }
        ],
    }

    normalized = normalize_run_trace(payload)

    assert normalized["version"] == 1
    assert normalized["events"][0]["step_id"] == "load-feed"
    assert normalized["events"][0]["unit_ids"] == ["feed"]


def test_normalize_run_trace_rejects_empty_events():
    with pytest.raises(RunTraceValidationError, match="at least one event"):
        normalize_run_trace({"version": 1, "events": []})


def test_normalize_run_trace_rejects_event_without_visible_content():
    payload = {
        "version": 1,
        "events": [
            {
                "step_id": "empty",
                "label": "Empty",
                "status": "running",
                "duration_ms": 100,
            }
        ],
    }

    with pytest.raises(RunTraceValidationError, match="visible trace content"):
        normalize_run_trace(payload)
