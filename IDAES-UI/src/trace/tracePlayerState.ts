import type { RunTrace, RunTraceEvent, TracePlayerState } from "./types";

export function createInitialTracePlayerState(trace: RunTrace): TracePlayerState {
  if (trace.events.length === 0) {
    throw new Error("trace must contain at least one event");
  }
  return { activeIndex: 0, isPlaying: false, speed: 1 };
}

export function nextTraceStep(state: TracePlayerState, trace: RunTrace): TracePlayerState {
  return {
    ...state,
    activeIndex: Math.min(state.activeIndex + 1, trace.events.length - 1),
  };
}

export function previousTraceStep(state: TracePlayerState): TracePlayerState {
  return { ...state, activeIndex: Math.max(state.activeIndex - 1, 0) };
}

export function resetTracePlayer(state: TracePlayerState): TracePlayerState {
  return { ...state, activeIndex: 0, isPlaying: false };
}

export function getActiveTraceEvent(
  state: TracePlayerState,
  trace: RunTrace
): RunTraceEvent {
  return trace.events[state.activeIndex];
}

export function toggleTracePlayback(state: TracePlayerState): TracePlayerState {
  return { ...state, isPlaying: !state.isPlaying };
}

export function setTraceSpeed(state: TracePlayerState, speed: number): TracePlayerState {
  if (speed <= 0) {
    throw new Error("speed must be positive");
  }
  return { ...state, speed };
}
