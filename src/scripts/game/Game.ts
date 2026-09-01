import { GAMEPLAY_CONFIG } from "../config/gameplay";
import { toggleAxis } from "./Axis";
import { isSupported } from "./Collision";
import type { GameState } from "./GameState";
import { initialPlayer, type PlayerRuntime } from "./Player";
import type { RoadSegment } from "./Road";

export interface GameSnapshot {
  state: GameState;
  player: PlayerRuntime;
}

export interface GameCallbacks {
  onStart?: () => void;
  onFall?: () => void;
  onComplete?: () => void;
}

const RESTART_DELAY_SECONDS = GAMEPLAY_CONFIG.restartDelayMs / 1000;

// The whole rule set and the whole state machine live here (PLAN.md §20): no
// DOM, no Canvas, no AudioContext, and — per the movement correction — no
// corner-detection window either. A click always toggles the movement axis;
// whether that was the right moment is decided purely by whether the
// player's continuous position is still supported afterwards.
export class Game {
  private state: GameState = "ready";
  private player: PlayerRuntime = initialPlayer();
  private endedElapsed = 0; // seconds spent in "falling"/"completed" so far

  constructor(
    private readonly segments: RoadSegment[],
    private readonly finalSegment: RoadSegment,
    private readonly callbacks: GameCallbacks = {},
  ) {}

  getState(): GameState {
    return this.state;
  }

  getPlayer(): PlayerRuntime {
    return this.player;
  }

  // Fraction of the fixed post-fall/post-complete cooldown that has elapsed
  // — the renderer uses this to animate the fall, nothing more.
  getEndedProgress(): number {
    return Math.min(1, this.endedElapsed / RESTART_DELAY_SECONDS);
  }

  // The single entry point for every click/tap/Space press. Its effect
  // depends entirely on the current state. Rhythm-quality feedback (accent
  // sound, particles, pulses) is coordinated by the caller, which knows
  // whether this trigger was a mid-run toggle — see main.ts's TurnFeedback
  // wiring; this method only ever changes gameplay state.
  trigger(): void {
    if (this.state === "playing") {
      this.player = { ...this.player, axis: toggleAxis(this.player.axis) };
      return;
    }
    if (this.state === "ready" || this.state === "restarting") {
      this.player = initialPlayer();
      this.endedElapsed = 0;
      this.state = "playing";
      this.callbacks.onStart?.();
    }
    // "falling" and "completed" ignore triggers until the fixed cooldown
    // promotes them to "restarting".
  }

  // Forces the run back to "ready" — used only when synchronization can't be
  // guaranteed (e.g. the tab was hidden mid-run), never by normal gameplay.
  reset(): void {
    this.player = initialPlayer();
    this.endedElapsed = 0;
    this.state = "ready";
  }

  step(dt: number): GameSnapshot {
    if (this.state === "falling" || this.state === "completed") {
      this.endedElapsed += dt;
      if (this.endedElapsed >= RESTART_DELAY_SECONDS) this.state = "restarting";
      return this.snapshot();
    }

    if (this.state !== "playing") return this.snapshot();

    const distance = GAMEPLAY_CONFIG.baseSpeed * dt;
    const x = this.player.axis === "x" ? this.player.x + distance : this.player.x;
    const z = this.player.axis === "z" ? this.player.z + distance : this.player.z;
    this.player = { ...this.player, x, z };

    if (!isSupported(x, z, this.segments, GAMEPLAY_CONFIG.supportForgiveness)) {
      this.state = "falling";
      this.callbacks.onFall?.();
      return this.snapshot();
    }

    if (this.hasReachedEnd()) {
      this.state = "completed";
      this.callbacks.onComplete?.();
    }

    return this.snapshot();
  }

  private hasReachedEnd(): boolean {
    return this.finalSegment.axis === "x"
      ? this.player.x >= this.finalSegment.endX
      : this.player.z >= this.finalSegment.endZ;
  }

  private snapshot(): GameSnapshot {
    return { state: this.state, player: this.player };
  }
}
