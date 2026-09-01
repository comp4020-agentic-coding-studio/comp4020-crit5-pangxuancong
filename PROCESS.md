# Process overview

A reading-guide to how this crit's game — a one-button rhythm-navigation
game built directly from a Canon-in-D beatmap — came together.

## What I built

A small browser game where the player has exactly one input (click, tap, or
Space): it toggles which of two positive world axes they're travelling
along. The road is authored directly from a music timeline — every
consecutive pair of notes in an original piano arrangement of the Canon-in-D
harmonic skeleton becomes one road segment, so a long musical interval is a
long segment and a short one is short, exactly. The piano's left hand
(chords following the same progression) plays on its own fixed schedule;
the right hand — the melody — is missing until the player turns for it,
quantized onto the beat so it stays musically in tune even when a click
isn't frame-perfect. Missing a corner, or turning where there isn't one,
sends the player off the road into the void. No on-screen instructions
anywhere: the opening geometry teaches the one mechanic on its own.

## The moments that mattered

1. **The first playable pass was thrown away, not patched.** It modelled
   the game as an abstract "click matches the beat or not" state machine
   with no real 2D movement
   ([`c94e6b7`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/c94e6b7)).
   After playing it, that abstraction was rejected outright — it never
   produced the feel of actually travelling and turning — and reverted
   cleanly with `git revert`
   ([`4d4109e`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/4d4109e))
   rather than patched, so the rejected attempt stayed visible in history
   instead of being erased.
2. **The movement model itself needed a second correction.** A
   four-direction clockwise cycle let the route loop back on itself into
   nested, self-intersecting geometry. It was replaced with continuous
   two-axis forward travel — the player always advances along exactly one
   of two positive axes, position is real floating-point `(x, z)`, and
   whether a turn "worked" is decided purely by whether the player is still
   standing on a road segment afterward, never by an abstract
   distance-to-corner timing window
   ([`560b299`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/560b299)).
3. **Two independently-ticking clocks caused a real desync, and the fix
   generalized a principle I'd only half-applied.** Music was correctly
   scheduled against `AudioContext.currentTime`, but the player's own
   movement was still integrated frame-by-frame from
   `requestAnimationFrame`'s own delta — close enough on a short run to
   look fine, but drifting audibly out of sync with the piano within
   ~20 seconds. The fix samples the audio clock once per frame and uses
   its delta as the physics step instead
   ([`0541342`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/0541342)).
   Writing "audio uses AudioContext time" down as a rule wasn't enough —
   it had to be true everywhere gameplay touched time, not just in the
   audio module.
4. **The level stopped being an approximation of the music and became the
   music.** Corner positions are now generated directly from the same
   timeline the piano plays from — no separate BPM grid standing in for
   it. That surfaced a second, quieter version of the same clock-alignment
   problem: the accompaniment's chord changes were dividing the total
   duration evenly (8 equal slices) while the melody's own harmony changes
   every 4 beats (7 unequal-looking slices, because 28 isn't divisible by
   8 in the way that mattered) — audible as the two hands sounding
   "wrong together" even though both read the same clock
   ([`993bd1c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/993bd1c),
   fixed in
   [`f14778a`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/f14778a)).
   The fix came with a regression test asserting the chords change only at
   a time the melody itself marks as a new harmony, so a future edit to
   either can't silently reintroduce the same mismatch.
5. **A bug that only showed up off my own desktop.** The camera's forward
   lead was a fixed number of world units, and the projection's scale was a
   fixed pixels-per-world-unit constant, so the lead's pixel footprint was
   identical in absolute terms on every device — a small fraction of a wide
   desktop window, most of a narrow phone's width. On a phone the road was
   effectively pushed half off screen every time the player's axis
   changed. The fix makes the projection scale responsively to canvas
   width instead of assuming a desktop-sized viewport
   ([`67041f9`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/67041f9)).

## Playtesting

Playing the finished build (not reading the code) surfaced two things worth
changing
([`e9d3193`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/e9d3193)):

- **The turn felt too tight.** `supportForgiveness` widened from 10 to 18
  (`config/gameplay.ts`) so a click a little early or late has more room
  before it costs the round — the road support area, not a timing window,
  is what decides this, so the fix is a single number rather than new logic.
- **The piano still read as a clean synth tone**, not a struck string,
  even after the earlier inharmonicity/hammer-noise pass. Added a detuned
  unison pair on the fundamental and 2nd partial (two "strings" a few cents
  apart — the slow beating between them is a big part of what makes a
  sustained piano note feel alive) and a two-stage decay on those same
  partials (quick initial drop, then a slower singing tail) instead of one
  flat exponential ramp, which had been reading as a bell rather than a
  piano.

Still to check before the crit: is the first corner readable inside ten
seconds without any text, and does the left-hand/melody handoff feel like
*playing* the piece rather than watching it play.

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that a
reflection entry the marker reads is in `reflections/`, and that your
`CLAUDE.md` is there — before a marker ever opens the file.
