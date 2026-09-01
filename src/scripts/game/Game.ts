import { GAMEPLAY_CONFIG } from "../config/gameplay";
import { canTurn, isSupported } from "./Collision";
import type { GameState } from "./GameState";
import type { Segment } from "./Level";
import { initialPlayer, type PlayerRuntime } from "./Player";

export interface GameSnapshot {
  state: GameState;
  player: PlayerRuntime;
}

export interface GameCallbacks {
  onStart?: () => void;
  onTurnSuccess?: () => void;
  onFall?: () => void;
  onComplete?: () => void;
}

const RESTART_DELAY_SECONDS = GAMEPLAY_CONFIG.restartDelayMs / 1000;

// The whole rule set and the whole state machine live here (PLAN.md §20): no
// DOM, no Canvas, no AudioContext. That separation is what keeps
// Collision.ts's rules testable without a browser, and keeps every state
// transition in one place instead of scattered boolean flags.
export class Game {
  private state: GameState = "ready";
  private player: PlayerRuntime = initialPlayer();
  private pendingTurn = false;
  private endedElapsed = 0; // seconds spent in "falling"/"completed" so far

  constructor(
    private readonly level: Segment[],
    private readonly distancePerBeat: number,
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

  // The single entry point for every click/tap/Space press. What it does
  // depends entirely on the current state — the caller doesn't decide.
  trigger(): void {
    if (this.state === "playing") {
      this.pendingTurn = true;
      return;
    }
    if (this.state === "ready" || this.state === "restarting") {
      this.player = initialPlayer();
      this.pendingTurn = false;
      this.endedElapsed = 0;
      this.state = "playing";
      this.callbacks.onStart?.();
    }
    // "falling" and "completed" ignore triggers until the fixed cooldown
    // promotes them to "restarting" — see step().
  }

  step(dt: number): GameSnapshot {
    if (this.state === "falling" || this.state === "completed") {
      this.endedElapsed += dt;
      if (this.endedElapsed >= RESTART_DELAY_SECONDS) this.state = "restarting";
      return this.snapshot();
    }

    if (this.state !== "playing") return this.snapshot();

    const segment = this.level[this.player.segmentIndex];
    if (!segment) {
      this.state = "completed";
      this.callbacks.onComplete?.();
      return this.snapshot();
    }

    const segmentLength = segment.beats * this.distancePerBeat;
    this.player.distanceIntoSegment += GAMEPLAY_CONFIG.baseSpeed * dt;
    const distanceToCorner = segmentLength - this.player.distanceIntoSegment;

    if (this.pendingTurn) {
      this.pendingTurn = false;
      if (canTurn(distanceToCorner)) {
        this.player.segmentIndex += 1;
        this.player.distanceIntoSegment = Math.max(0, -distanceToCorner);
        this.callbacks.onTurnSuccess?.();

        if (this.player.segmentIndex >= this.level.length) {
          this.state = "completed";
          this.callbacks.onComplete?.();
        }
        return this.snapshot();
      }
      // A click outside the turn window is ignored rather than punished or
      // acted on early — see PLAN.md §6.
    }

    if (!isSupported(distanceToCorner)) {
      this.state = "falling";
      this.callbacks.onFall?.();
    }

    return this.snapshot();
  }

  private snapshot(): GameSnapshot {
    return { state: this.state, player: this.player };
  }
}
