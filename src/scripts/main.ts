import { CANON_TIMELINE, musicalIntensity, timelineDuration } from "./music/canonTimeline";
import { GAMEPLAY_CONFIG } from "./config/gameplay";
import { buildBeatmapRoad } from "./game/Beatmap";
import { roadBounds } from "./game/Road";
import { Game } from "./game/Game";
import { initialCamera, updateCamera } from "./game/Camera";
import { bindTrigger } from "./game/Input";
import { getTimingGrade, type TimingGrade } from "./game/TurnTiming";
import { applyTurnFeedback, createFeedbackState, decayFeedback } from "./game/TurnFeedback";
import { render } from "./rendering/Renderer";
import { createBackgroundState, updateBackground } from "./rendering/Background";
import { startAudioEngine, stopAudioEngine, type AudioEngine } from "./audio/AudioEngine";
import { startSequencer, type SequencerHandle } from "./audio/Sequencer";
import { playAccent, playComplete, playFall } from "./audio/SoundEffects";
import { getMusicPulse } from "./audio/BeatPulse";

// AudioContext.currentTime is the one clock this run reads timing from
// (PLAN.md §5) — this is the only place that subtraction happens.
function songTimeOf(engine: AudioEngine): number {
  return engine.context.currentTime - engine.startTime;
}

const MAX_DT = 1 / 20; // clamp large frame gaps (e.g. tab switching) — PLAN.md §25
const MAX_TRAIL_POINTS = 4000;

const canvasElement = document.querySelector<HTMLCanvasElement>("#game");
if (canvasElement) {
  const canvas = canvasElement;
  const context2d = canvas.getContext("2d");
  if (context2d) {
    const ctx = context2d;

    // The level IS the music: every corner's world position comes straight
    // from the timeline's turn events (PLAN.md's beatmap revision, §1/§2).
    const { segments, corners } = buildBeatmapRoad(CANON_TIMELINE, GAMEPLAY_CONFIG.baseSpeed, GAMEPLAY_CONFIG.pathWidth);
    const finalSegment = segments[segments.length - 1];
    const cornerTimes = corners.map((corner) => corner.time);
    const songDuration = timelineDuration(CANON_TIMELINE);
    const background = createBackgroundState(roadBounds(segments));

    let audioEngine: AudioEngine | null = null;
    let sequencerHandle: SequencerHandle | null = null;
    let cornerIndex = 0; // the next corner this run's clicks are graded against
    let camera = initialCamera();
    let trail: { x: number; z: number }[] = [];
    let feedback = createFeedbackState();
    let lastFrameTime = performance.now();
    const idleClockStart = performance.now();

    const teardownAudio = (): void => {
      sequencerHandle?.stop();
      sequencerHandle = null;
      if (audioEngine) stopAudioEngine(audioEngine);
      audioEngine = null;
    };

    const game = new Game(segments, finalSegment, {
      onStart: () => {
        teardownAudio(); // never let a previous run's nodes/timers survive
        const engine = startAudioEngine();
        audioEngine = engine;
        sequencerHandle = startSequencer(engine, CANON_TIMELINE, engine.startTime);
        cornerIndex = 0;
        trail = [];
        feedback = createFeedbackState();
      },
      onFall: () => {
        if (audioEngine) playFall(audioEngine);
      },
      onComplete: () => {
        if (audioEngine) playComplete(audioEngine);
      },
    });

    // §37: don't let gameplay desync from a Web-Audio-scheduled soundtrack
    // that kept advancing while the tab was hidden — restart the attempt
    // cleanly on return instead of guessing how to resynchronize.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && game.getState() === "playing") {
        teardownAudio();
        game.reset();
      }
    });

    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", resize);
    resize();

    const handleTrigger = (): void => {
      const wasPlaying = game.getState() === "playing";
      const playerBeforeToggle = game.getPlayer();
      game.trigger();

      if (wasPlaying && audioEngine) {
        const engine = audioEngine;
        // Each click during a run corresponds, in order, to the next corner
        // in the beatmap — the player can't skip one (PLAN.md §6). Timing
        // quality never affects survival, only feedback.
        const expected = corners[cornerIndex]?.time;
        const midiNote = corners[cornerIndex]?.midiNote;
        cornerIndex += 1;

        if (expected !== undefined) {
          const errorSeconds = Math.abs(songTimeOf(engine) - expected);
          const grade: TimingGrade = getTimingGrade(errorSeconds);
          applyTurnFeedback(
            feedback,
            { position: { x: playerBeforeToggle.x, z: playerBeforeToggle.z }, timingGrade: grade, midiNote },
            (g, note) => playAccent(engine, g, note),
          );
        }
      }
    };
    bindTrigger(canvas, handleTrigger);

    const frame = (now: number): void => {
      const dt = Math.min(MAX_DT, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      const snapshot = game.step(dt);

      if (snapshot.state === "playing") {
        trail.push({ x: snapshot.player.x, z: snapshot.player.z });
        if (trail.length > MAX_TRAIL_POINTS) trail.shift();
      }

      camera = updateCamera(camera, snapshot.player);
      decayFeedback(feedback, dt);
      updateBackground(background, dt);

      const songTime = audioEngine ? songTimeOf(audioEngine) : 0;
      const beatPulse = audioEngine ? getMusicPulse(CANON_TIMELINE, songTime) : 0;
      const intensity = musicalIntensity(songTime, CANON_TIMELINE);
      const nextCornerTime = cornerTimes[cornerIndex] ?? null;

      render(ctx, canvas.clientWidth, canvas.clientHeight, {
        state: snapshot.state,
        segments,
        cornerTimes,
        songTime,
        musicalIntensity: intensity,
        player: snapshot.player,
        trail,
        camera,
        idlePhase: (now - idleClockStart) / 1000,
        fallProgress: snapshot.state === "falling" ? game.getEndedProgress() : 0,
        cubeScale: feedback.cubeScale,
        trailPulse: feedback.trailPulse,
        cameraPulse: feedback.cameraPulse,
        particles: feedback.particles,
        beatPulse,
        background,
        lastGrade: feedback.lastGrade,
        audioStarted: audioEngine !== null,
        nextCornerTime,
      });

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);

    void songDuration; // reserved for the full 2-3 minute arrangement's resolution arc (PLAN.md §14)
  }
}
