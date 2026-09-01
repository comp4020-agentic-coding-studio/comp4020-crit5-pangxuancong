import type { Track, TrackStep } from "./track";

export type RunStatus = "idle" | "running" | "fallen" | "won";

export interface SimState {
  status: RunStatus;
  beatIndex: number;
}

export function initialState(): SimState {
  return { status: "idle", beatIndex: 0 };
}

export function start(): SimState {
  return { status: "running", beatIndex: 0 };
}

// The one tested game rule: a beat's required action is either "click" or
// "don't click", and doing the other thing is leaving the track boundary.
export function resolveStep(step: TrackStep, clicked: boolean): "alive" | "fallen" {
  return step.corner === clicked ? "alive" : "fallen";
}

// Advances the simulation by exactly one beat, given whether the player
// clicked during that beat. Pure: no clock, no audio, no rendering.
export function advance(state: SimState, track: Track, clicked: boolean): SimState {
  if (state.status !== "running") return state;

  const step = track[state.beatIndex];
  if (!step) return { status: "won", beatIndex: state.beatIndex };

  if (resolveStep(step, clicked) === "fallen") {
    return { status: "fallen", beatIndex: state.beatIndex };
  }

  const nextIndex = state.beatIndex + 1;
  if (nextIndex >= track.length) return { status: "won", beatIndex: nextIndex };
  return { status: "running", beatIndex: nextIndex };
}
