# COMP4020 Crit 5 — Browser Game Development Master Prompt

You are acting as a **senior game developer, gameplay engineer, frontend engineer, interaction designer, audio engineer, and QA engineer**.

Your task is to design and implement a polished original browser game for ANU COMP4020 Agentic Coding Studio Crit 5.

The game is **inspired by the core interaction philosophy of Dancing Line**, but it must NOT copy its visual assets, level layouts, music, branding, UI, characters, or copyrighted content.

Create an original experience based around:

> **Auto-movement + one-button turning + rhythm + spatial anticipation**

The final result should feel like a small experimental indie game rather than a clone.

---

# 0. PROJECT PHILOSOPHY

The central design principle is:

> One input. Increasing understanding.

The player should NEVER gain additional controls.

Do NOT introduce:

* double click
* hold
* jump
* dash
* swipe gestures
* abilities
* inventory
* upgrade systems

The entire game must use only:

> **Click / Tap / Space → Turn**

Depth must come from increasingly difficult interpretation of the world, not increasingly complicated controls.

The player's progression should be:

> SEE → REACT → LISTEN → PREDICT → REMEMBER

At the beginning, the player follows clearly visible geometry.

Later, visual information becomes less reliable and rhythm becomes increasingly important.

Near the climax, the player should feel that they are no longer simply navigating a path:

> **they are performing the level.**

---

# 1. COURSE REQUIREMENTS

This project must satisfy COMP4020 Crit 5.

Official brief:

https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/05-game/

The important constraints are:

* It is a small browser game.
* One mechanic is enough.
* A new player should understand the first interaction in approximately 10 seconds.
* It should remain interesting for several minutes.
* There must be NO tutorial.
* There must be NO "How to Play" screen.
* There must be NO instructional text explaining the mechanic.
* The README must not function as hidden instructions.
* The opening interaction itself must teach the player what to do.
* A player must be able to fail.
* The game must eventually end.
* A stranger must be able to reach an ending within five minutes.
* At least one gameplay rule must have a focused automated test.
* At least one design change must come from playtesting the finished game.
* The project must remain client-side/static.
* It must be suitable for GitHub Pages deployment.
* The repository must contain PROCESS.md.
* The repository must contain reflections/crit-5.md.
* Development history should be represented by meaningful commits.

Treat these constraints as non-negotiable acceptance criteria.

---

# 2. WORKING TITLE

Use a temporary working title such as:

**TRACE**

or

**PULSE**

or

**LINE**

Do not spend significant development time building a title screen.

The title may appear subtly if aesthetically appropriate, but gameplay must begin almost immediately.

There should be no traditional main menu.

---

# 3. CORE GAMEPLAY

The player controls a small luminous geometric object travelling automatically along a suspended path.

The object continuously moves forward at a constant baseline speed.

The player does NOT control movement speed.

The player has exactly one meaningful action:

> CLICK / TAP / SPACE → rotate movement direction by 90 degrees.

Conceptually:

East → South → West → North → East

However, the actual implementation may use a camera/world representation that creates an isometric or perspective illusion.

The input should remain logically deterministic.

Example:

```ts
turnClockwise(direction)
```

should always return the next direction.

---

# 4. BASIC GAME LOOP

The game loop should be:

1. Player automatically moves.
2. Path approaches a corner.
3. Player clicks near the correct moment.
4. Character turns.
5. Successful turn aligns with the musical beat.
6. Player continues.
7. Difficulty gradually increases.
8. Wrong timing causes the player to leave the path.
9. The character falls / dissolves.
10. Music stops or breaks.
11. Very short fail animation.
12. The run restarts quickly.

The restart loop should feel extremely fast.

Target:

**failure → replayable state within approximately 0.5–1.0 seconds**

Avoid:

* modal dialogs
* "Game Over"
* Retry buttons
* loading screens
* confirmation prompts

Failure itself should teach the player.

---

# 5. SELF-TEACHING OPENING

The first 10–15 seconds are extremely important.

There must be no written instruction such as:

"Click to turn."

Instead construct the opening geometry so that clicking becomes obvious.

Suggested opening:

A straight narrow path.

The player automatically moves toward an extremely visible 90-degree corner.

The player has enough time to notice:

* the moving object
* the edge
* the continuation of the path
* the upcoming turn

If the player does nothing:

the object leaves the platform and falls.

The game immediately restarts.

This failure functions as instruction.

The second attempt should make the solution obvious.

The first several turns should be forgiving.

Suggested structure:

Turn 1:
very easy

Turn 2:
very easy

Turn 3:
clearly synchronized to music

Turn 4:
first slight timing challenge

Turn 5+:
normal gameplay begins

The player should understand the mechanic without text.

---

# 6. TURNING SYSTEM

Do NOT require pixel-perfect clicking.

Create a forgiving **turn window**.

The player may click slightly before reaching the exact corner.

Suggested conceptual model:

```ts
turnWindowBefore = 0.12–0.18 seconds
turnWindowAfter = 0.08–0.15 seconds
```

But preferably calculate this spatially rather than purely temporally.

For example:

```ts
distanceToCorner <= turnTolerance
```

If the player clicks within the valid window:

* snap the character cleanly onto the new path direction
* preserve forward momentum
* play successful turn feedback
* continue

If the player clicks too early:

Do NOT immediately rotate into empty space if that would feel unfair.

Choose one consistent rule and test it through gameplay.

Possible rule:

Clicks outside the valid turning region are ignored.

This is likely preferable because it preserves the rhythm-game feeling without punishing accidental slightly-early clicks.

However, the final decision should be based on feel.

---

# 7. FAIRNESS PRINCIPLE

The game must feel difficult but fair.

Every failure should communicate:

> "I know why I failed."

Not:

> "The collision system cheated me."

Avoid collision detection based purely on tiny visual overlaps.

Separate:

**visual geometry**

from

**gameplay collision geometry**

The collision/support region should be slightly more generous than the visible platform.

Use an invisible forgiveness margin.

For example:

```ts
visualPathWidth = 48
safePathWidth = 56
```

Tune these values through playtesting.

---

# 8. MUSIC AS GAMEPLAY

Music must be structurally integrated into gameplay.

Do NOT treat music as background decoration.

The level geometry should correlate with musical rhythm.

The core relationship should be:

> Turn points correspond to meaningful beats.

For example:

Beat:
1 — 2 — 3 — 4

Geometry:
straight — turn — straight — turn

Early in the game, the player primarily watches the level.

Eventually they realize:

**the music predicts upcoming turns.**

That discovery should happen naturally.

---

# 9. AUDIO IMPLEMENTATION

Prefer procedural/original audio using:

**Web Audio API**

rather than copyrighted music.

The experience can use:

* kick
* click
* soft percussion
* bass pulse
* synth pad
* subtle melodic layers

Build the soundtrack from simple generated sounds or original synthesized patterns.

Do NOT download copyrighted music.

Create a musical timeline based on:

```ts
BPM
beatDuration
measure
beatIndex
```

Example:

```ts
const BPM = 112;
const secondsPerBeat = 60 / BPM;
```

Gameplay timing and musical timing should reference the same shared clock where practical.

Avoid independent timers drifting apart.

Prefer:

```ts
AudioContext.currentTime
```

or a synchronized game clock.

The audio architecture should ensure that:

* gameplay stays synchronized
* restart resets audio predictably
* pause / tab switching does not catastrophically desync the level

---

# 10. AUDIO FEEDBACK

Successful turns should feel satisfying.

A correct turn may trigger:

* subtle percussion hit
* short tonal click
* brief bass accent
* tiny screen pulse
* trail intensity increase

Do not overwhelm the player with effects.

The interaction should feel:

**precise**

rather than:

**explosive**

The player should gradually feel that successful turns contribute to the song.

Conceptually:

> The player is playing the level like an instrument.

---

# 11. LEVEL DESIGN

Build ONE polished level.

Do NOT waste development time building a level selection system.

Target successful completion time:

approximately **2–3 minutes**

A new player should still be able to reach an ending within five minutes after some retries.

Structure the level into four invisible phases.

Do NOT display phase names to the player.

---

## PHASE 1 — SEE

Purpose:

Teach navigation.

Duration:

approximately 20–30 seconds.

Characteristics:

* entire upcoming path visible
* wide corners
* slow speed
* simple musical pattern
* predictable turns
* strong environmental affordance

Player thought:

> "I need to click at corners."

---

## PHASE 2 — REACT / PREDICT

Purpose:

Introduce anticipation.

Duration:

approximately 30–45 seconds.

Changes:

* speed increases slightly
* turns become closer together
* some patterns contain consecutive corners
* camera framing allows less distant visibility
* music begins strongly predicting geometry

Example sequence:

straight
turn
straight
turn
turn
long straight
turn

The player should begin anticipating rather than simply reacting.

---

## PHASE 3 — LISTEN

Purpose:

Shift information from vision toward sound.

Duration:

approximately 40–60 seconds.

Introduce progressive information loss.

Possible methods:

* distant path fades into fog
* future tiles appear only shortly before arrival
* environment darkens
* path contrast decreases
* temporary sections disappear

The player should still have enough information to succeed.

Do NOT suddenly remove the entire path.

Make the transition gradual.

Player realization:

> "The rhythm is telling me when the corners happen."

---

## PHASE 4 — REMEMBER / PERFORM

Purpose:

Create the climax.

Duration:

approximately 30–45 seconds.

Some upcoming route information becomes intentionally incomplete.

By now:

* rhythmic language has been established
* movement patterns have repeated
* the player understands the musical structure

Some turns may need to be anticipated from:

* music
* previous patterns
* brief visual flashes
* memory

This is the hardest section.

However, it should never become arbitrary memorization.

The player should feel:

> "I should have known."

not:

> "There was no possible way to know."

At the musical climax, the player should feel that they are performing the route.

---

# 12. ENDING

Do NOT use a generic:

"YOU WIN"

screen unless absolutely necessary.

Instead create an environmental ending.

Recommended ending:

After completing the final turn:

1. music resolves
2. movement slows slightly
3. camera begins pulling backward / upward
4. the player's complete travelled path remains visible
5. the path reveals itself as a deliberate larger composition

Possibilities:

* abstract waveform
* pulse shape
* geometric symbol
* musical waveform-like composition
* elegant abstract pattern

The player's trail should make the completed route feel like something they have drawn.

The emotional idea is:

> They did not merely travel through the song.

> They drew the song.

After several seconds, allow the game to restart naturally.

No UI-heavy ending required.

---

# 13. FAILURE EXPERIENCE

Failure should be aesthetically intentional.

When the player leaves the path:

1. movement continues briefly into empty space
2. object loses support
3. music cuts or becomes muffled
4. player drops downward / dissolves
5. trail fragments slightly
6. screen briefly dims
7. restart begins

Total duration should remain short.

Avoid ragdoll complexity.

Failure should feel elegant and readable.

---

# 14. VISUAL DIRECTION

Do NOT imitate Dancing Line's visual identity.

Create an original minimalist visual system.

Overall mood:

**minimalist / abstract / musical / architectural / atmospheric**

Preferred composition:

* dark neutral background
* luminous player
* restrained geometry
* subtle depth
* thin atmospheric fog
* clear silhouette
* polished typography only where unavoidable

Avoid:

* cartoon graphics
* excessive gradients
* arcade neon clichés
* overly saturated RGB lighting
* giant UI elements
* excessive particle effects
* skeuomorphic buttons

The game should look intentionally designed.

Think:

**interactive audiovisual installation**

rather than:

**mobile game clone**

---

# 15. PLAYER VISUAL

Player should be a simple geometric object.

Possibilities:

* cube
* prism
* small bright node
* short vertical line
* glowing square

Keep silhouette readable.

Player should leave a persistent or semi-persistent trail behind it.

Trail represents:

> completed musical history

Possible implementation:

* Canvas path
* small fading geometry
* mesh strip
* CSS/canvas line

Trail must not materially harm performance.

---

# 16. PATH VISUAL

The path should initially be highly readable.

Recommended:

* suspended narrow geometric platform
* abstract void below
* slightly dimensional perspective
* clear corners

Avoid realistic scenery.

Geometry should communicate gameplay.

Path visual states may include:

* normal
* approaching beat
* fading
* hidden
* completed
* dangerous/off-path

Use animation to subtly emphasize upcoming rhythmic moments.

Do NOT display explicit arrows.

---

# 17. CAMERA

Camera should help gameplay rather than show off.

Use a smooth tracking camera.

Possible perspective:

* slightly elevated
* pseudo-isometric
* forward-biased framing

The player should not remain perfectly centered.

Leave more visible space ahead than behind.

Camera should smoothly interpolate:

```ts
camera += (target - camera) * smoothing
```

Avoid excessive shake.

Successful turns may produce only a tiny pulse.

Failure may use slight downward movement.

Final completion uses a zoom-out reveal.

---

# 18. RENDERING TECHNOLOGY

Recommended architecture:

**Vite + TypeScript + HTML5 Canvas + Web Audio API**

Avoid heavy libraries unless they provide a clear benefit.

Do NOT add Three.js unless genuinely necessary.

A polished 2D / pseudo-3D canvas implementation is preferable to an unnecessarily complicated WebGL architecture.

If an existing repository/framework already exists:

* inspect it first
* preserve useful project structure
* avoid destructive rewrites
* integrate cleanly

Keep the game entirely client-side.

No backend.

---

# 19. HIGH-LEVEL FILE ARCHITECTURE

Use a clean modular architecture similar to:

```text
src/
  main.ts

  game/
    Game.ts
    GameState.ts
    Player.ts
    Level.ts
    Path.ts
    Collision.ts
    Input.ts
    Camera.ts

  audio/
    AudioEngine.ts
    Sequencer.ts
    SoundEffects.ts

  rendering/
    Renderer.ts
    TrailRenderer.ts
    Effects.ts

  levels/
    level01.ts

  config/
    gameplay.ts
    visual.ts
    audio.ts

  utils/
    math.ts
    timing.ts

tests/
  turning.test.ts
  collision.test.ts

PROCESS.md

reflections/
  crit-5.md
```

Exact structure may be adjusted if a simpler architecture is cleaner.

Avoid giant 1000-line files.

Separate:

* state
* rendering
* audio
* level data
* collision
* input

> Repo note: this project's test convention is `spec/*.test.ts` (see
> `spec/README.md`), not a top-level `tests/` folder — that convention is
> kept instead of introducing a second test directory.

---

# 20. GAME STATE MACHINE

Use an explicit state machine.

Suggested states:

```ts
type GameState =
  | "ready"
  | "playing"
  | "falling"
  | "restarting"
  | "completed";
```

Avoid scattering flags such as:

```ts
isDead
hasStarted
isRestarting
didWin
```

throughout unrelated code.

State transitions should be controlled centrally.

---

# 21. LEVEL REPRESENTATION

Do NOT hard-code dozens of unrelated coordinates directly into the renderer.

Represent path geometry as data.

For example:

```ts
type Segment = {
  direction: Direction;
  length: number;
  beats: number;
};
```

or:

```ts
type TurnEvent = {
  beat: number;
  direction: Direction;
};
```

Ideally level structure is derived from musical timing.

For example:

```ts
const level = [
  { beats: 4, turn: "right" },
  { beats: 2, turn: "right" },
  { beats: 4, turn: "right" },
  { beats: 1, turn: "right" },
];
```

This makes rhythm and geometry structurally connected.

> Implementation note: since the only input turns clockwise, every segment
> boundary is a turn and direction is derivable from segment index alone
> (`east, south, west, north, east, ...`) — the level data only needs to
> carry `{ beats }` per segment.

---

# 22. SHARED RHYTHM MODEL

Create one authoritative rhythm model.

Avoid this:

```text
audio timing system
+
completely unrelated movement timing system
```

Prefer:

```text
BPM
↓
beat duration
↓
segment lengths / movement speed
↓
turn positions
```

For constant speed:

```ts
distancePerBeat = speed * secondsPerBeat;
```

Therefore a four-beat segment can be:

```ts
segmentLength = distancePerBeat * 4;
```

This makes geometry naturally synchronized with music.

---

# 23. INPUT

Support:

Desktop:

* mouse click
* Space key

Touchscreen:

* tap

Use Pointer Events when possible.

Example:

```ts
pointerdown
keydown: Space
```

Prevent unwanted:

* text selection
* page scrolling from Space
* double-tap zoom where relevant

Input handling should be centralized.

---

# 24. RESPONSIVE DESIGN

The game must work across the course's marking viewports.

Do not assume one desktop resolution.

Canvas should react to:

```ts
window.innerWidth
window.innerHeight
devicePixelRatio
```

Render crisply on Retina/high-DPI displays.

Gameplay geometry should use world coordinates independent of CSS pixel dimensions.

Camera framing should adapt to aspect ratio.

Test:

* desktop landscape
* narrower browser window
* mobile portrait where practical

The game should remain playable without horizontal/vertical webpage scrolling.

---

# 25. PERFORMANCE

Target:

**60 FPS**

Avoid allocating large objects every animation frame.

Use:

```ts
requestAnimationFrame
```

Use delta time carefully.

Clamp extremely large frame deltas after tab switching.

Example:

```ts
dt = Math.min(dt, MAX_DT);
```

Ensure tab switching does not launch the player enormous distances.

---

# 26. SOUND START RESTRICTION

Browsers restrict autoplay audio.

The game must handle this elegantly without displaying an instructional modal.

AudioContext can begin on the player's first click/tap/key interaction.

The opening geometry must naturally invite that interaction.

Do NOT put:

"Click to enable audio."

Instead make the first gameplay interaction simultaneously unlock audio.

Before audio activation, ambient silence is acceptable.

---

# 27. FIRST INPUT EDGE CASE

Because the player's first click may simultaneously:

* unlock Web Audio
* perform a game turn

ensure both actions happen correctly.

Do not consume the player's first gameplay click merely to initialize audio.

---

# 28. COLLISION / SUPPORT SYSTEM

Prefer a deterministic mathematical system.

The game should know:

* current segment
* next corner
* player progress
* lateral deviation

Avoid expensive generic polygon collision if unnecessary.

The player can conceptually move along:

```ts
currentSegment
progressAlongSegment
direction
```

Turn success changes current segment.

Failure occurs when forward movement leaves supported geometry.

This architecture makes testing easier.

---

# 29. AUTOMATED TESTING

Use an appropriate lightweight test framework such as:

**Vitest**

At least one core rule MUST have a focused automated test.

Recommended tests:

### Turning rule

```ts
expect(turnClockwise("east")).toBe("south");
expect(turnClockwise("south")).toBe("west");
expect(turnClockwise("west")).toBe("north");
expect(turnClockwise("north")).toBe("east");
```

### Valid turn window

```ts
expect(canTurn(distanceToCorner, tolerance)).toBe(true);
```

### Failure rule

```ts
expect(isSupported(player, path)).toBe(false);
```

when the player has clearly left the path.

The test should verify gameplay logic rather than trivial implementation detail.

Testing does NOT replace playtesting.

---

# 30. PLAYTESTING REQUIREMENT

After the playable game is complete:

perform actual gameplay testing at multiple viewport sizes.

Specifically examine:

* Is the first action obvious?
* Is the first corner fair?
* Does clicking feel responsive?
* Is the turn tolerance generous enough?
* Is audio synchronized?
* Can a player identify why they failed?
* Does the visual fading become frustrating?
* Is Phase 4 difficult but readable?
* Is restart fast enough?
* Can the level be completed inside five minutes?
* Does the final reveal feel intentional?

Make at least one meaningful gameplay change based on playtesting.

Example:

Before:

```text
turn tolerance = 24 px
```

Observed:

Players correctly anticipated corners but frequently failed because the accepted area was too narrow.

After:

```text
turn tolerance = 34 px
```

This is the kind of change that should be documented.

Do NOT fabricate playtesting results.

If actual human playtesting has not occurred yet, leave explicit TODO placeholders for the student to fill in after testing.

---

# 31. PROCESS.md

Create:

```text
PROCESS.md
```

It should concisely document:

## Concept

Why the project uses:

* one-button interaction
* rhythm
* visual information reduction

## Agent Direction

Explain the major prompts/directions used to guide implementation.

## Grounding

Explain relevant references and constraints.

## Major Decisions

Examples:

* Canvas instead of Three.js
* procedural audio
* BPM-linked geometry
* forgiving turn windows
* no tutorial

## Corrections

Record important cases where generated implementation needed correction.

## Playtesting

Leave a clearly marked place to record:

* what was observed
* what changed
* why

Do not invent observations before testing.

---

# 32. REFLECTION

Create:

```text
reflections/crit-5.md
```

Use a concise structure.

Possible headings:

```markdown
# Crit 5 Reflection

## What I made

## Why this mechanic

## Teaching without instructions

## Automated testing

## What changed after playing it

## Agentic development process

## What I would improve
```

Do not fabricate the student's personal reflection.

Provide a useful scaffold with factual implementation details and clearly marked areas requiring personal input.

---

# 33. NO-TUTORIAL AUDIT

Before considering the project finished, search the entire visible experience for instructional language.

There must NOT be visible phrases such as:

* Click to turn
* Tap to move
* Press space
* How to play
* Instructions
* Avoid falling
* Follow the rhythm
* Stay on the path
* Retry

The game itself must teach these concepts.

README also must not act as a substitute tutorial.

---

# 34. ACCESSIBILITY / INPUT

Even though instructions are forbidden, implement reasonable technical accessibility.

Support keyboard and pointer input.

Avoid relying solely on tiny color differences for important gameplay states.

Use:

* brightness
* movement
* geometry
* sound

together where appropriate.

Respect:

```css
prefers-reduced-motion
```

where possible without destroying essential gameplay.

Do not create major flashing effects.

---

# 35. VISUAL EFFECTS

Allowed subtle effects:

* trail glow
* tiny pulse on successful turn
* soft particles
* fog
* path fade
* player squash/stretch
* motion easing
* subtle background movement

Avoid excessive effects that interfere with gameplay readability.

The player must always know where their character is.

---

# 36. SECRET DESIGN RULE

Every visual effect must answer one of these questions:

1. Where am I?
2. Where am I going?
3. Did I act correctly?
4. Why did I fail?
5. Where is the rhythm?

If an effect answers none of these, strongly consider removing it.

---

# 37. DIFFICULTY CURVE

Do not primarily increase difficulty through raw speed.

Prefer increasing **information complexity**.

Good:

* shorter prediction horizon
* rhythm variations
* consecutive turns
* fading geometry
* repeating motifs
* visual memory
* musical anticipation

Bad:

* absurd speed
* tiny collision windows
* random obstacles
* intentionally misleading visuals
* arbitrary instant death

The player's improvement should feel cognitive and rhythmic.

---

# 38. NO RANDOMNESS IN THE CORE LEVEL

The main level should be deterministic.

Every attempt should have:

* the same route
* same timing
* same music
* same patterns

This allows:

> fail → learn → retry → improve

Do NOT randomize important corners.

Procedural ambience may vary slightly, but gameplay should remain deterministic.

---

# 39. POLISH PRIORITIES

If development time becomes limited, prioritize in this exact order:

1. Correct core movement
2. Good turning feel
3. Fair failure
4. Fast restart
5. Self-teaching opening
6. Rhythm synchronization
7. Complete level
8. Difficulty progression
9. Responsive layout
10. Automated test
11. Ending
12. Visual polish
13. Additional particle effects

Never sacrifice gameplay quality for visual effects.

---

# 40. GITHUB PAGES

The final build must work as a static GitHub Pages deployment.

Configure Vite base paths appropriately.

Do not rely on:

* backend APIs
* local filesystem paths
* development-only servers
* absolute localhost URLs

Ensure:

```bash
npm run build
```

succeeds.

If possible also include:

```bash
npm run test
```

and

```bash
npm run dev
```

> Repo note: this project uses `pnpm`, and Astro (not raw Vite) sits under
> the build per the course's stack conversion — `pnpm build` / `pnpm test` /
> `pnpm dev` are the equivalent commands here.

---

# 41. DEVELOPMENT STRATEGY

Do NOT attempt to implement everything in one enormous uncontrolled code generation pass.

Work incrementally.

### Milestone 1

Create minimal playable prototype:

* auto movement
* one turn
* basic path
* fall state
* restart

STOP and verify.

### Milestone 2

Create data-driven level.

Verify multiple corners.

### Milestone 3

Add rhythm clock and procedural audio.

Verify synchronization.

### Milestone 4

Add visual feedback and player trail.

### Milestone 5

Build four-phase level progression.

### Milestone 6

Add final reveal.

### Milestone 7

Responsive testing and gameplay tuning.

### Milestone 8

Automated tests.

### Milestone 9

PROCESS.md and reflection scaffold.

### Milestone 10

Final audit and GitHub Pages build.

At every milestone:

* run the game
* inspect console errors
* run available tests
* correct regressions before continuing

Do not knowingly pile new features on top of broken behavior.

---

# 42. CODE QUALITY

Use:

* strict TypeScript
* descriptive names
* small focused modules
* explicit types
* centralized configuration

Avoid:

```ts
any
```

unless absolutely necessary.

Avoid meaningless comments.

Comments should explain:

**why**

not:

**what obvious code does**

Do not prematurely over-engineer.

---

# 43. CONFIGURATION

Keep gameplay tuning parameters centralized.

Example:

```ts
export const GAMEPLAY_CONFIG = {
  bpm: 112,
  baseSpeed: 180,
  turnTolerance: 32,
  restartDelay: 700,
  pathWidth: 48,
  collisionForgiveness: 6,
};
```

This allows rapid playtesting adjustments.

Avoid magic numbers scattered throughout files.

---

# 44. DEBUG MODE

Create a development-only debug mode.

Possible debug information:

* current beat
* current segment
* FPS
* valid turn radius
* collision/support bounds
* player coordinates

Debug information MUST NOT appear in the production experience.

For example:

```ts
const DEBUG = import.meta.env.DEV;
```

This will make gameplay tuning significantly easier.

---

# 45. ORIGINALITY REQUIREMENT

The inspiration is Dancing Line's high-level idea:

> automatic movement with rhythmic turning

Everything else should be independently designed.

Do NOT reproduce:

* Dancing Line maps
* recognizable levels
* copyrighted songs
* UI
* visual assets
* logos
* exact camera presentation
* title
* sound effects

The final piece should be describable as:

> "a minimalist rhythm-navigation browser game"

rather than:

> "a Dancing Line clone."

---

# 46. TARGET EXPERIENCE

The intended emotional progression:

### 0–10 seconds

"What is happening?"

↓

"Oh — I turn here."

### 10–40 seconds

"Okay, I understand this."

### 40–90 seconds

"The turns are matching the music."

### 90–150 seconds

"Wait — I can use the rhythm to predict the path."

### Final section

"I'm basically playing the song."

### Ending

"Oh — that whole route formed something."

This emotional progression is more important than adding additional mechanics.

---

# 47. FINAL QUALITY BAR

The project should feel:

* intentional
* responsive
* minimal
* understandable
* rhythmic
* fair
* original
* finished

It should NOT feel like:

* a technical demo
* a tutorial exercise
* a Dancing Line clone
* a template game
* an unfinished prototype
* an overengineered engine

---

# 48. ACCEPTANCE CHECKLIST

Before declaring the project complete, verify every item.

## Gameplay

* [ ] Player moves automatically
* [ ] Click/tap/Space turns
* [ ] Exactly one core input
* [ ] Player can fail
* [ ] Game can be completed
* [ ] Restart is fast
* [ ] First action is understandable without text
* [ ] Difficulty increases through understanding
* [ ] Entire level is deterministic

## Rhythm

* [ ] Musical beats correspond meaningfully with geometry
* [ ] Audio and gameplay remain synchronized
* [ ] Successful turns provide musical feedback
* [ ] Later gameplay rewards listening

## Level

* [ ] Phase 1 teaches visually
* [ ] Phase 2 requires anticipation
* [ ] Phase 3 reduces visual information
* [ ] Phase 4 rewards rhythm/memory
* [ ] Final section remains fair
* [ ] Completion takes roughly 2–3 minutes

## Visual

* [ ] Player is always readable
* [ ] Path is readable early
* [ ] Information fades progressively
* [ ] Effects reinforce gameplay
* [ ] Final route reveal works
* [ ] Visual identity is original

## Technical

* [ ] TypeScript cleanly compiles
* [ ] No console errors
* [ ] npm run build succeeds
* [ ] npm run test succeeds
* [ ] Game works on multiple viewport sizes
* [ ] High-DPI rendering works
* [ ] GitHub Pages build works
* [ ] No backend required

## Crit requirements

* [ ] No tutorial
* [ ] No instruction screen
* [ ] No README tutorial
* [ ] Wrong moves can cause failure
* [ ] There is an ending
* [ ] Stranger can reach an ending within five minutes
* [ ] At least one focused automated gameplay test exists
* [ ] Playtesting has occurred
* [ ] A playtesting-driven change is documented
* [ ] PROCESS.md exists
* [ ] reflections/crit-5.md exists

---

# 49. IMPORTANT AGENT BEHAVIOUR

Before changing code:

1. Inspect the existing repository.
2. Understand its current framework and structure.
3. Preserve useful existing work.
4. Identify anything that conflicts with this specification.
5. Then implement incrementally.

Do not ask me to make routine engineering decisions.

Make sensible senior-engineer decisions yourself.

Only stop for clarification if a decision fundamentally changes the artistic concept.

When multiple implementations are possible:

prefer the option that is:

1. simpler
2. deterministic
3. easier to test
4. easier to tune
5. more performant
6. visually clean

After every significant implementation stage:

* run relevant tests
* run TypeScript/build checks
* inspect for errors
* fix discovered issues before proceeding

Do not claim something works unless you have actually verified it where tooling allows.

---

# 50. FINAL PRODUCT VISION

The finished project should communicate this concept without ever explaining it explicitly:

> At first, the player watches the road.

> Then the player starts hearing the road.

> Eventually the road disappears, but the rhythm remains.

The player begins by navigating space.

They finish by performing music.

The entire experience should emerge from a single interaction:

> **TURN.**

---

# 51. MOVEMENT ARCHITECTURE CORRECTION (supersedes §3/§4/§17/§21/§22/§28/§29 above)

The four-direction clockwise cycle (East → South → West → North) described in
§3 was wrong: it lets the level loop back on itself, producing nested
rectangles, self-intersections, and maze-like geometry instead of a
continuously advancing route.

## Replace it with two-axis forward movement

```ts
type MovementAxis = "x" | "z";
```

The player always moves forward (never negative) along exactly one of two
positive world axes. A click toggles which axis:

```text
X+ → Z+ → X+ → Z+ → X+ ...
```

There is no direction vector, no clockwise order, no four-way cycle.

## Continuous position, no snapping

Player position is continuous floating-point `(x, z)`. There is no
segment-index/distance-into-segment abstraction, and no automatic correction
after a turn. Clicking early cuts inside a corner; clicking late overshoots
outside it; either can cost support. A small invisible forgiveness margin is
allowed on the collision area, never on timing.

## One shared world-space coordinate system

Player, road, collision, and trail all use the same `(x, z)` ground plane.
Projection into screen space (an isometric `(x, z, height)` → screen
transform) happens ONLY in the rendering layer. Collision is never computed
in projected/screen coordinates.

## Road as area, not centerline

```ts
interface RoadSegment {
  axis: "x" | "z";
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  width: number;
}
```

Consecutive segments' rectangles overlap slightly (each extended backward
along its own axis by half its width) to close the joint — never by
snapping the player.

## Turning is not corner-detection

Remove any `distanceToCorner < tolerance` check. A click always toggles the
axis, whenever it happens. The game never asks "was this click inside a
timing window" — it only ever asks "is the player still supported by some
road segment". Fairness comes from generous collision area, not from a
separate abstract timing rule.

## Gameplay sandbox

Before layering phases, fading visibility, particles, or elaborate music
back on: get a single deterministic 8-segment alternating test level (the
`TEST_LEVEL` in `levels/testLevel.ts`) feeling good, with a plain camera,
plain platform, and instant restart. The four-phase level design, fog
horizon, and turn-pulse feedback from §11/§35 are POSTPONED, not deleted —
they return once the core movement is right.
