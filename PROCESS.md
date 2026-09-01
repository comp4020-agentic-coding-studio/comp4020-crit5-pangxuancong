# Process overview

A reading-guide to how this crit's game — a one-button rhythm-navigation
prototype, working title "Pulse" — came together.

## What I built

A small browser game where the player has exactly one input (click, tap, or
Space) that turns the travelling player 90 degrees clockwise. The path is a
deterministic sequence of straight segments; missing a turn — or turning when
there isn't one — sends the player off the edge. Corner spacing and a
synthesized kick pulse share one BPM-derived clock, and visibility of the
upcoming path narrows across four invisible phases so the game shifts from
mostly-visual to mostly-rhythmic as it goes on. No on-screen instructions
anywhere: the opening geometry (a long straight run into an obvious first
corner) is the whole tutorial.

## The moments that mattered

1. **Design direction changed mid-build, and the first attempt was thrown
   away rather than patched.** The first playable pass
   ([`c94e6b7`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/c94e6b7))
   modelled the game as an abstract "click matches the beat or not" state
   machine with no real 2D movement. After playing it, that abstraction was
   rejected outright rather than tuned — it didn't produce the feel of
   actually travelling and turning. Rather than patch it, I reverted it
   cleanly ([`4d4109e`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/4d4109e))
   and rebuilt around real position/direction state
   ([`c5f0406`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/c5f0406)),
   where the player's world position is a derived function of segment index
   and in-segment progress. `git revert` rather than a manual undo kept the
   rejected attempt visible in history instead of erasing it.
2. **Collision was deliberately split into two rules with two different
   tolerances, not one.** `canTurn` (the forgiving window a click can land
   in) and `isSupported` (how far past a missed corner the player can travel
   before actually falling) are separate functions in
   [`c5f0406`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/c5f0406)'s
   `game/Collision.ts`, each independently tunable in
   `config/gameplay.ts`. The reasoning: a turn window that's too generous
   would let a badly-timed click still succeed, silently lowering the
   game's actual difficulty; keeping a separate, more generous forgiveness
   margin only on the *fail* side means near-misses still cost the round but
   never feel like the collision system cheated.
3. **State ownership was centralized in one class instead of scattered
   flags.** `Game.ts` (also in
   [`c5f0406`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/c5f0406))
   owns the entire `ready → playing → falling/completed → restarting`
   machine and is the only thing `main.ts` calls `trigger()`/`step()` on;
   every other module (rendering, audio, camera) only reads its output. This
   is what let the fall rule and the restart cooldown get focused Vitest
   coverage (`spec/collision.test.ts`) without touching Canvas or
   `AudioContext` at all.

## Playtesting

TODO — record what an actual playthrough surfaced before the crit: is the
first corner readable inside ten seconds, is the turn window forgiving
enough, does the fog-in during phase 3 feel gradual rather than sudden, and
whether the tuned values in `config/gameplay.ts` (`turnToleranceBefore`,
`turnToleranceAfter`, `supportForgiveness`) needed adjusting after playing
the finished build rather than reading the code. Cite the commit that
changes those numbers once it exists.

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that a
reflection entry the marker reads is in `reflections/`, and that your
`CLAUDE.md` is there — before a marker ever opens the file.
