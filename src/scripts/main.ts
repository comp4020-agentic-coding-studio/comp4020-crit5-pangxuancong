import { BEAT_DURATION, beatIndexAt, createClock, elapsedBeats, startClock, type Clock } from "./clock";
import { scheduleCanon } from "./audio";
import { advance, initialState, start as startSim, type SimState } from "./sim";
import { TRACK } from "./track";
import { render, PARTICLE_LIFETIME, type Particle } from "./render";
import { bindTrigger } from "./input";

const canvasElement = document.querySelector<HTMLCanvasElement>("#game");
if (canvasElement) {
  const canvas = canvasElement;
  const context = canvas.getContext("2d");
  if (context) {
    const ctx = context;
    const RESTART_DELAY_MS = 1000;

    let state: SimState = initialState();
    let clock: Clock | null = null;
    let pendingClick = false;
    let particles: Particle[] = [];
    let roundEndedAt: number | null = null;
    let lastFrameTime = performance.now();
    const idleClockStart = performance.now();

    const resize = (): void => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const resetToIdle = (): void => {
      if (clock) clock.audioContext.close();
      state = initialState();
      clock = null;
      pendingClick = false;
      particles = [];
      roundEndedAt = null;
    };

    const onTrigger = (): void => {
      if (state.status === "idle") {
        const audioContext = new AudioContext();
        const fresh = startClock(createClock(audioContext));
        scheduleCanon(audioContext, fresh.startTime ?? audioContext.currentTime);
        clock = fresh;
        state = startSim();
        return;
      }
      if (state.status === "running") {
        pendingClick = true;
        return;
      }
      // fallen or won: a fixed pause before the same tap can restart it, so a
      // reflex tap right after failing doesn't erase the moment of failing.
      if (roundEndedAt !== null && performance.now() - roundEndedAt > RESTART_DELAY_MS) {
        resetToIdle();
      }
    };

    bindTrigger(canvas, onTrigger);

    const frame = (now: number): void => {
      const dt = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      if (state.status === "running" && clock) {
        const targetBeat = beatIndexAt(clock, BEAT_DURATION);
        while (state.status === "running" && state.beatIndex < targetBeat) {
          const step = TRACK[state.beatIndex];
          const clicked = pendingClick;
          pendingClick = false;
          const next = advance(state, TRACK, clicked);
          if (next.status === "running" && step?.corner && clicked) {
            particles.push({ x: canvas.width * 0.28, y: canvas.height * 0.55 - 10, age: 0 });
          }
          state = next;
        }
        if (state.status !== "running") roundEndedAt = performance.now();
      }

      particles = particles.map((p) => ({ ...p, age: p.age + dt })).filter((p) => p.age < PARTICLE_LIFETIME);

      const idlePhase = (now - idleClockStart) / 1000;
      const fractionalBeat = clock && state.status === "running" ? elapsedBeats(clock) % 1 : 0;

      render(ctx, canvas, { state, track: TRACK, fractionalBeat, idlePhase, particles });

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }
}
