import type { RunTrace, RunTraceEvent, TracePlayerState, TraceStatus } from "./types";
import css from "./TracePlayer.module.css";

interface TracePlayerProps {
  trace: RunTrace;
  state: TracePlayerState;
  activeEvent: RunTraceEvent;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
}

const statusClass: Record<TraceStatus, string> = {
  pending: css.statusPending,
  running: css.statusRunning,
  solved: css.statusSolved,
  warning: css.statusWarning,
  error: css.statusError,
};

const playbackSpeeds = [0.5, 1, 2, 4];

function formatDuration(durationMs: number, speed: number): string {
  const seconds = Math.max(durationMs / speed / 1000, 0.1);
  return `${seconds.toFixed(seconds >= 10 ? 0 : 1)} s`;
}

export default function TracePlayer({
  trace,
  state,
  activeEvent,
  onPrevious,
  onNext,
  onReset,
  onTogglePlay,
  onSpeedChange,
}: TracePlayerProps) {
  const isFirstStep = state.activeIndex === 0;
  const isLastStep = state.activeIndex === trace.events.length - 1;
  const hasValues = Boolean(activeEvent.values && activeEvent.values.length > 0);

  return (
    <aside className={css.tracePlayer} aria-label="Flowsheet run trace">
      <div className={css.header}>
        <div>
          <div className={css.eyebrow}>
            Step {state.activeIndex + 1} of {trace.events.length}
          </div>
          <div className={css.stepTitle}>{activeEvent.label}</div>
        </div>
        <span className={`${css.status} ${statusClass[activeEvent.status]}`}>
          {activeEvent.status}
        </span>
      </div>

      {activeEvent.message && (
        <div className={css.message}>{activeEvent.message}</div>
      )}

      <div className={css.metrics}>
        <span>{formatDuration(activeEvent.duration_ms, state.speed)}</span>
        <span>{activeEvent.unit_ids.length} units</span>
        <span>{activeEvent.stream_ids.length} streams</span>
      </div>

      {hasValues && (
        <dl className={css.values}>
          {activeEvent.values!.map((value) => (
            <div key={value.label} className={css.value}>
              <dt>{value.label}</dt>
              <dd>
                {String(value.value)}
                {value.units && <span> {value.units}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className={css.controls}>
        <button type="button" onClick={onReset} disabled={isFirstStep}>
          Reset
        </button>
        <button type="button" onClick={onPrevious} disabled={isFirstStep}>
          Prev
        </button>
        <button type="button" onClick={onTogglePlay}>
          {state.isPlaying ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={onNext} disabled={isLastStep}>
          Next
        </button>
        <select
          value={state.speed}
          aria-label="Playback speed"
          onChange={(event) => onSpeedChange(Number(event.target.value))}
        >
          {playbackSpeeds.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
