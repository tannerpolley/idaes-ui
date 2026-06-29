import { describe, expect, it } from "vitest";
import {
  createInitialTracePlayerState,
  nextTraceStep,
  previousTraceStep,
  resetTracePlayer,
  setTraceSpeed,
} from "./tracePlayerState";
import type { RunTrace } from "./types";

const trace: RunTrace = {
  version: 1,
  events: [
    {
      step_id: "one",
      label: "One",
      status: "running",
      unit_ids: ["U1"],
      stream_ids: [],
      duration_ms: 100,
    },
    {
      step_id: "two",
      label: "Two",
      status: "solved",
      unit_ids: [],
      stream_ids: ["S1"],
      duration_ms: 100,
    },
  ],
};

describe("trace player state", () => {
  it("advances and stops at the last event", () => {
    const initial = createInitialTracePlayerState(trace);
    const first = nextTraceStep(initial, trace);
    const second = nextTraceStep(first, trace);

    expect(first.activeIndex).toBe(1);
    expect(second.activeIndex).toBe(1);
  });

  it("moves backward and stops at the first event", () => {
    const state = { ...createInitialTracePlayerState(trace), activeIndex: 1 };
    const first = previousTraceStep(state);
    const second = previousTraceStep(first);

    expect(first.activeIndex).toBe(0);
    expect(second.activeIndex).toBe(0);
  });

  it("resets playback state", () => {
    const state = {
      ...createInitialTracePlayerState(trace),
      activeIndex: 1,
      isPlaying: true,
    };

    expect(resetTracePlayer(state).activeIndex).toBe(0);
    expect(resetTracePlayer(state).isPlaying).toBe(false);
  });

  it("accepts only positive playback speeds", () => {
    const state = createInitialTracePlayerState(trace);

    expect(setTraceSpeed(state, 2).speed).toBe(2);
    expect(() => setTraceSpeed(state, 0)).toThrow("speed must be positive");
  });
});
