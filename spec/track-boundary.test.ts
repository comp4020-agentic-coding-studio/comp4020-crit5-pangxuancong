import { describe, expect, it } from "vitest";
import { advance, initialState, resolveStep, start } from "../src/scripts/sim";
import type { Track } from "../src/scripts/track";

// Spec line: "it can be lost: a wrong move is possible, and play ends
// somewhere". The rule under test: leaving the track boundary — clicking on
// a straight beat, or missing a corner beat — ends the round.
describe("track boundary rule", () => {
  it("stays alive when a corner beat is clicked", () => {
    expect(resolveStep({ corner: true }, true)).toBe("alive");
  });

  it("falls when a corner beat is missed", () => {
    expect(resolveStep({ corner: true }, false)).toBe("fallen");
  });

  it("stays alive when a straight beat is left alone", () => {
    expect(resolveStep({ corner: false }, false)).toBe("alive");
  });

  it("falls when a straight beat is clicked by mistake", () => {
    expect(resolveStep({ corner: false }, true)).toBe("fallen");
  });

  it("ends the run in a fallen state as soon as one beat is missed", () => {
    const track: Track = [{ corner: false }, { corner: true }, { corner: false }];
    let state = start();
    state = advance(state, track, false); // beat 0: straight, correct
    expect(state.status).toBe("running");
    state = advance(state, track, false); // beat 1: corner, missed
    expect(state.status).toBe("fallen");
  });

  it("reaches a won state after the last beat is cleared", () => {
    const track: Track = [{ corner: false }, { corner: true }];
    let state = start();
    state = advance(state, track, false);
    state = advance(state, track, true);
    expect(state.status).toBe("won");
  });

  it("never advances once fallen or won", () => {
    const track: Track = [{ corner: false }];
    const fallen = advance(start(), track, true);
    expect(fallen.status).toBe("fallen");
    expect(advance(fallen, track, false)).toEqual(fallen);
  });

  it("starts idle until start() is called", () => {
    expect(initialState().status).toBe("idle");
  });
});
