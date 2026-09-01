import { describe, expect, it } from "vitest";
import { isSupported } from "../src/scripts/game/Collision";
import { buildRoadSegments } from "../src/scripts/game/Road";
import { GAMEPLAY_CONFIG } from "../src/scripts/config/gameplay";
import { Game } from "../src/scripts/game/Game";
import type { LevelSegment } from "../src/scripts/game/Level";

const WIDTH = 40;
const FORGIVENESS = 10;
const DISTANCE_PER_BEAT = 20;

// Spec line: "it can be lost: a wrong move is possible, and play ends
// somewhere". Support is a world-space area test, never a distance-to-
// corner timing check (PLAN.md's movement correction, §7).
describe("isSupported", () => {
  const segments = buildRoadSegments([{ axis: "x", beats: 4 }], DISTANCE_PER_BEAT, WIDTH);

  it("supports a point in the middle of the segment", () => {
    expect(isSupported(40, 0, segments, FORGIVENESS)).toBe(true);
  });

  it("supports a point just inside the forgiveness margin past the road edge", () => {
    const z = WIDTH / 2 + FORGIVENESS - 1;
    expect(isSupported(40, z, segments, FORGIVENESS)).toBe(true);
  });

  it("does not support a point clearly outside every road segment", () => {
    expect(isSupported(40, WIDTH, segments, FORGIVENESS)).toBe(false);
  });
});

describe("Game (continuous two-axis movement)", () => {
  const level: LevelSegment[] = [
    { axis: "x", beats: 2 },
    { axis: "z", beats: 2 },
  ];

  function makeGame(): Game {
    const segments = buildRoadSegments(level, DISTANCE_PER_BEAT, GAMEPLAY_CONFIG.pathWidth);
    return new Game(segments, segments[segments.length - 1]);
  }

  it("falls at the first corner when the axis is never toggled", () => {
    const game = makeGame();
    game.trigger(); // ready -> playing
    for (let i = 0; i < 200 && game.getState() === "playing"; i++) game.step(1 / 60);
    expect(game.getState()).toBe("falling");
  });

  it("stays supported and reaches the end when the axis is toggled near the corner", () => {
    const game = makeGame();
    game.trigger(); // ready -> playing
    const dt = 1 / 60;
    const firstSegmentLength = level[0].beats * DISTANCE_PER_BEAT;
    const stepsToApproach = Math.floor(firstSegmentLength / (GAMEPLAY_CONFIG.baseSpeed * dt));
    for (let i = 0; i < stepsToApproach; i++) game.step(dt);

    game.trigger(); // toggle axis right at the corner

    for (let i = 0; i < 400 && game.getState() === "playing"; i++) game.step(dt);

    expect(game.getState()).toBe("completed");
  });

  it("ignores a trigger while falling or completed until the cooldown elapses", () => {
    const game = makeGame();
    game.trigger();
    for (let i = 0; i < 200 && game.getState() === "playing"; i++) game.step(1 / 60);
    expect(game.getState()).toBe("falling");

    game.trigger(); // ignored — cooldown hasn't elapsed
    expect(game.getState()).toBe("falling");

    for (let i = 0; i < 120; i++) game.step(1 / 60); // exhaust the restart cooldown
    expect(game.getState()).toBe("restarting");

    game.trigger(); // now it restarts
    expect(game.getState()).toBe("playing");
    expect(game.getPlayer()).toEqual({ x: 0, z: 0, axis: "x" });
  });
});
