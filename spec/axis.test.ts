import { describe, expect, it } from "vitest";
import { toggleAxis } from "../src/scripts/game/Axis";

// Spec line: "click/tap → toggle between the two forward axes" — the entire
// input space this game has.
describe("toggleAxis", () => {
  it("toggles x to z", () => {
    expect(toggleAxis("x")).toBe("z");
  });

  it("toggles z to x", () => {
    expect(toggleAxis("z")).toBe("x");
  });
});
