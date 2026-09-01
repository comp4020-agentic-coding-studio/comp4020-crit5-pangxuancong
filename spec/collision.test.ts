import { describe, expect, it } from "vitest";
import { canTurn, isSupported } from "../src/scripts/game/Collision";
import { GAMEPLAY_CONFIG } from "../src/scripts/config/gameplay";
import { Game } from "../src/scripts/game/Game";

// Spec line: "it can be lost: a wrong move is possible, and play ends
// somewhere". These are the two rules that decide that: the forgiving turn
// window, and when missing it costs the run.
describe("canTurn (the turn window)", () => {
  it("accepts a click exactly at the corner", () => {
    expect(canTurn(0)).toBe(true);
  });

  it("accepts an early click within the before-tolerance", () => {
    expect(canTurn(GAMEPLAY_CONFIG.turnToleranceBefore - 1)).toBe(true);
  });

  it("accepts a late click within the after-tolerance", () => {
    expect(canTurn(-(GAMEPLAY_CONFIG.turnToleranceAfter - 1))).toBe(true);
  });

  it("rejects a click far too early", () => {
    expect(canTurn(GAMEPLAY_CONFIG.turnToleranceBefore + 50)).toBe(false);
  });

  it("rejects a click far too late", () => {
    expect(canTurn(-(GAMEPLAY_CONFIG.turnToleranceAfter + 50))).toBe(false);
  });
});

describe("isSupported (leaving the track)", () => {
  it("stays supported just past the corner, inside the forgiveness margin", () => {
    const justPast = -(GAMEPLAY_CONFIG.turnToleranceAfter + GAMEPLAY_CONFIG.supportForgiveness - 1);
    expect(isSupported(justPast)).toBe(true);
  });

  it("is unsupported once forgiveness is exhausted", () => {
    const wellPast = -(GAMEPLAY_CONFIG.turnToleranceAfter + GAMEPLAY_CONFIG.supportForgiveness + 1);
    expect(isSupported(wellPast)).toBe(false);
  });
});

describe("Game state machine", () => {
  const distancePerBeat = 40;
  const level = [{ beats: 1 }, { beats: 1 }];

  it("falls when a corner is missed entirely", () => {
    const game = new Game(level, distancePerBeat);
    game.trigger(); // ready -> playing
    // Run well past the first corner without ever triggering again.
    for (let i = 0; i < 50; i++) game.step(1 / 60);
    expect(game.getState()).toBe("falling");
  });

  it("stays alive and advances when the turn is triggered in time", () => {
    const game = new Game(level, distancePerBeat);
    game.trigger(); // ready -> playing
    const segmentLength = level[0].beats * distancePerBeat;
    const dt = 1 / 60;
    const stepsToApproachCorner = Math.floor((segmentLength - 1) / (GAMEPLAY_CONFIG.baseSpeed * dt));
    for (let i = 0; i < stepsToApproachCorner; i++) game.step(dt);
    game.trigger(); // turn
    game.step(dt);
    expect(game.getState()).toBe("playing");
    expect(game.getPlayer().segmentIndex).toBe(1);
  });

  it("ignores a trigger while falling or completed until the cooldown elapses", () => {
    const game = new Game(level, distancePerBeat);
    game.trigger();
    for (let i = 0; i < 50; i++) game.step(1 / 60);
    expect(game.getState()).toBe("falling");

    game.trigger(); // ignored — cooldown hasn't elapsed
    expect(game.getState()).toBe("falling");

    for (let i = 0; i < 120; i++) game.step(1 / 60); // exhaust the restart cooldown
    expect(game.getState()).toBe("restarting");

    game.trigger(); // now it restarts
    expect(game.getState()).toBe("playing");
    expect(game.getPlayer().segmentIndex).toBe(0);
  });
});
