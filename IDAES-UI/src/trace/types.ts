export type TraceStatus = "pending" | "running" | "solved" | "warning" | "error";

export interface TraceValue {
  label: string;
  value: string | number | boolean;
  units?: string;
}

export interface RunTraceEvent {
  step_id: string;
  label: string;
  status: TraceStatus;
  unit_ids: string[];
  stream_ids: string[];
  duration_ms: number;
  message?: string;
  values?: TraceValue[];
}

export interface RunTrace {
  version: number;
  events: RunTraceEvent[];
}

export interface TracePlayerState {
  activeIndex: number;
  isPlaying: boolean;
  speed: number;
}
