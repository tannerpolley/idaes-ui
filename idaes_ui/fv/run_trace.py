#################################################################################
# The Institute for the Design of Advanced Energy Systems Integrated Platform
# Framework (IDAES IP) was produced under the DOE Institute for the
# Design of Advanced Energy Systems (IDAES).
#
# Copyright (c) 2018-2023 by the software owners: The Regents of the
# University of California, through Lawrence Berkeley National Laboratory,
# National Technology & Engineering Solutions of Sandia, LLC, Carnegie Mellon
# University, West Virginia University Research Corporation, et al.
# All rights reserved.  Please see the files COPYRIGHT.md and LICENSE.md
# for full copyright and license information.
#################################################################################
"""Run-trace schema used by the Flowsheet Visualizer animation player."""

from __future__ import annotations

from enum import Enum
from typing import Any, Callable

from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator


class RunTraceValidationError(ValueError):
    """Raised when run-trace data cannot be served to the visualizer."""


class TraceStatus(str, Enum):
    """Allowed event statuses in a deterministic run trace."""

    pending = "pending"
    running = "running"
    solved = "solved"
    warning = "warning"
    error = "error"


class TraceValue(BaseModel):
    """One display value associated with a trace event."""

    label: str = Field(min_length=1)
    value: int | float | str | bool
    units: str | None = None


class RunTraceEvent(BaseModel):
    """One replayable trace event keyed to flowsheet unit and stream IDs."""

    step_id: str = Field(min_length=1)
    label: str = Field(min_length=1)
    status: TraceStatus
    unit_ids: list[str] = Field(default_factory=list)
    stream_ids: list[str] = Field(default_factory=list)
    duration_ms: int = Field(default=1000, ge=0)
    message: str | None = None
    values: list[TraceValue] = Field(default_factory=list)

    @field_validator("unit_ids", "stream_ids")
    @classmethod
    def require_nonempty_ids(cls, ids: list[str]) -> list[str]:
        if any(not item.strip() for item in ids):
            raise ValueError("trace ids must be nonempty strings")
        return ids

    @model_validator(mode="after")
    def require_visible_content(self) -> "RunTraceEvent":
        if not self.unit_ids and not self.stream_ids and not self.message and not self.values:
            raise ValueError("each trace event must contain visible trace content")
        return self


class RunTrace(BaseModel):
    """Deterministic sequence of Flowsheet Visualizer replay events."""

    version: int = Field(default=1, ge=1)
    events: list[RunTraceEvent]

    @field_validator("events")
    @classmethod
    def require_events(cls, events: list[RunTraceEvent]) -> list[RunTraceEvent]:
        if not events:
            raise ValueError("run trace must contain at least one event")
        return events


TraceProvider = RunTrace | dict[str, Any] | Callable[[], RunTrace | dict[str, Any]]


def normalize_run_trace(trace: TraceProvider) -> dict[str, Any]:
    """Validate a trace provider and return JSON-ready trace data."""
    raw_trace = trace() if callable(trace) else trace
    try:
        model = raw_trace if isinstance(raw_trace, RunTrace) else RunTrace.model_validate(raw_trace)
    except ValidationError as err:
        raise RunTraceValidationError(str(err)) from err
    return model.model_dump(mode="json", exclude_none=True)
