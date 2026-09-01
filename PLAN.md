# Implementation plan — "A game" (crit 5)

A tap-to-turn rhythm runner in the style of Dancing Line, scored to a
self-synthesized rendition of Pachelbel's Canon. Single input (click/tap),
preset turn direction per corner, no on-screen instruction of any kind.

## Spec checklist this plan answers

- [ ] deployed and live at its public GitHub Pages URL by the cutoff
- [ ] loseable: leaving the track ends the round
- [ ] self-teaching: no instructions on screen or off; opening screen affords the first move
- [ ] a stranger reaches an ending inside five minutes
- [ ] one rule has a focused automated test; one change comes from playing, not reading code
- [ ] commits grow with the work; `PROCESS.md` and `reflections/crit-5.md` are current
- [ ] can account for how the work was directed, grounded and corrected

## Architecture

Strict separation between simulation and presentation, so the corner-cue
rendering can move from flat top-down to a rotating chase camera later without
touching game logic or tests.

```
src/
  scripts/
    track.ts       # track data: ordered list of segments, each a length + turn direction
    clock.ts        # maps AudioContext.currentTime -> beat index / progress ratio
    sim.ts          # pure state machine: position, alive/dead, win/lose — no DOM, no audio
    audio.ts        # Web Audio synthesis of the Canon melody + bass, exposes currentTime-based playback
    render.ts       # Canvas drawing: track, player, corner cue, fall/win animation — reads sim state, never mutates it
    input.ts        # click + touchstart handling, feeds sim
    main.ts         # wires clock/audio/sim/render/input together, owns the loop
  pages/
    index.astro
  styles/
    styles.css
spec/
  track-boundary.test.ts   # the one tested rule
```

`sim.ts` is the only place game rules live, and the only place tests touch.
`render.ts` depends on `sim.ts`'s output shape (position, direction, alive)
but `sim.ts` never imports `render.ts` — keeps the rotating-camera upgrade a
render-layer-only change.

## The tested rule

**Leaving the track boundary ends the round.**

`sim.ts` exposes a pure function, e.g.:

```ts
function checkBoundary(position: Position, track: Track): "alive" | "fallen"
```

Test feeds in-bounds and out-of-bounds coordinates against a fixed track
fixture and asserts the two outcomes. No timers, no Canvas, no audio — fast
and deterministic. This is the rule in the spec checklist; the corner-timing
hit window is deliberately NOT tested (see below).

## What is deliberately not tested

The hit-window tolerance (how early/late a click may land at a corner and
still count) is a feel decision, tuned by playing the built prototype, not
derived from a spec line. That tuning session is the "one change that came
from playing rather than reading code" item.

## Timing model

- `audio.ts` starts an `AudioContext`, schedules the melody/bass oscillators,
  and records `startTime = audioContext.currentTime` on first user gesture.
- Every animation frame, `main.ts` computes
  `elapsed = audioContext.currentTime - startTime` and passes it to `sim.ts`
  and `render.ts`. No `setTimeout`/`rAF`-based clock of its own — avoids drift
  over the ~2 minute run.
- Track segment lengths and corner timestamps are derived from the same note
  data that drives the synthesized melody, so track and music can never fall
  out of sync.

## Difficulty curve

Corner density and turn tempo track the Canon's own structure: sparse over
the opening bass-only bars, denser as melodic voices stack up mid-piece. No
separate difficulty parameter to hand-tune — the piece's own build supplies
it.

## No-tutorial mechanics

- **Idle screen**: canvas renders a looping idle animation (player figure
  swaying in place, or track gently pulsing) — no text, no button. This is
  the sole affordance before input.
- **Start**: first `click`/`touchstart` anywhere starts the `AudioContext`
  (satisfies the browser autoplay-gesture requirement for free) and begins
  the run in the same instant — no separate "press start" state.
- **First corner**: placed a short, fixed distance after the start, with the
  strongest visual cue in the whole track (see below) — teaches the only
  mechanic the game has before anything else happens.
- **Corner cue**: visual, not textual — the track is a raised walkable
  surface; a corner reads as the walkable surface literally turning, with the
  off-track area rendered as a drop (wall/cliff), high-contrast against the
  track color and distinguishable by brightness/shape alone (not color hue
  alone, for colorblind accessibility).
- **Restart**: on fall, music fades, frame freezes at the fall position and
  dims, then after a short fixed delay (~1s) a click/tap anywhere restarts
  from the very beginning — no checkpoints, no confirmation text.
- **Win**: reaching the end of the ~2 minute piece without falling ends the
  round in a win state (still no score, no text — visual-only resolution).

## Visual style

Flat, high-contrast geometric shapes (canvas-drawn rectangles/paths, no image
assets needed), background color/gradient shifts across musical sections —
close to the source game's look, and cheap to build within a one-week budget.
On successful corner hits, a small note-glyph particle burst emits from the
player mark as the only positive-feedback effect; no score or progress UI.

## Mobile / viewport

- Canvas resizes to the viewport (both marking viewports must be playable).
- Input listens to both `click` and `touchstart` (not mouse events only).
- Corner hit target and track width checked for playability on the smaller
  viewport specifically, not just desktop.

## Build order

1. `track.ts` + `sim.ts` + the boundary test — get the rule spec item green
   first, before any rendering exists.
2. `render.ts` with the flat top-down view against a hand-authored short
   track — confirm the corner-turn mechanic is legible with placeholder
   timing (no audio yet).
3. `audio.ts` — synthesize the Canon bass + melody, wire `clock.ts` to derive
   track timing from the same note data.
4. `input.ts` + `main.ts` — wire click/tap to `sim.ts`, connect the
   `AudioContext`-driven clock to the render loop.
5. Idle screen, fall/win presentation, note-glyph feedback particles.
6. Author the full ~2 minute track with the difficulty curve, then playtest
   repeatedly — this is where the hit-window tolerance gets tuned, and where
   the "change from playing" item comes from.
7. Mobile pass: resize handling, touch input, playtest on the smaller
   viewport.
8. Deploy to GitHub Pages, verify the live URL under the base path.

Commit at each numbered step (or smaller) rather than in one block at the
end — the spec's "commits that grew with the work" line and `PROCESS.md`'s
process narrative both depend on that trail existing.
