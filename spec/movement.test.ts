import { describe, expect, it } from "vitest";
import { Game } from "../src/scripts/game/Game";
import { buildRoadSegments } from "../src/scripts/game/Road";
import type { LevelSegment } from "../src/scripts/game/Level";

// Spec line: movement is continuous, always along exactly one axis at a
// time — never both, never negative (PLAN.md's movement correction, §1/§2).
describe("continuous single-axis movement", () => {
  const level: LevelSegment[] = [
    { axis: "x", beats: 10 },
    { axis: "z", beats: 10 },
  ];
  const distancePerBeat = 20;
  const segments = buildRoadSegments(level, distancePerBeat, 60);

  it("changes only x while on the x axis", () => {
    const game = new Game(segments, segments[segments.length - 1]);
    game.trigger(); // ready -> playing, axis "x"
    const before = game.getPlayer();
    game.step(1 / 60);
    const after = game.getPlayer();

    expect(after.x).toBeGreaterThan(before.x);
    expect(after.z).toBe(before.z);
  });

  it("changes only z while on the z axis", () => {
    const game = new Game(segments, segments[segments.length - 1]);
    game.trigger(); // ready -> playing, axis "x"
    game.trigger(); // toggled to "z"
    const before = game.getPlayer();
    game.step(1 / 60);
    const after = game.getPlayer();

    expect(after.z).toBeGreaterThan(before.z);
    expect(after.x).toBe(before.x);
  });
});
