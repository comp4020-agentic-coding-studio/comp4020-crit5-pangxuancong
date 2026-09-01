import { TEST_LEVEL } from "./levels/testLevel";
import { DISTANCE_PER_BEAT } from "./utils/timing";
import { GAMEPLAY_CONFIG } from "./config/gameplay";
import { BPM, SECONDS_PER_BEAT } from "./config/audio";
import { buildRoadSegments, roadBounds } from "./game/Road";
import { cornerBeatIndices } from "./game/Level";
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
import { createRhythmClock, getNearestBeatDistance, getSongTime, type RhythmClock } from "./audio/RhythmClock";
import { getBeatPulse } from "./audio/BeatPulse";

const MAX_DT = 1 / 20; // clamp large frame gaps (e.g. tab switching) — PLAN.md §25
const MAX_TRAIL_POINTS = 4000;

const canvasElement = document.querySelector<HTMLCanvasElement>("#game");
if (canvasElement) {
  const canvas = canvasElement;
  const context2d = canvas.getContext("2d");
  if (context2d) {
    const ctx = context2d;

    const segments = buildRoadSegments(TEST_LEVEL, DISTANCE_PER_BEAT, GAMEPLAY_CONFIG.pathWidth);
    const finalSegment = segments[segments.length - 1];
    const cornerBeats = cornerBeatIndices(TEST_LEVEL);
    const background = createBackgroundState(roadBounds(segments));

    let audioEngine: AudioEngine | null = null;
    let rhythmClock: RhythmClock | null = null;
    let sequencerHandle: SequencerHandle | null = null;
    let cornerTimes: number[] = [];
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
      rhythmClock = null;
      cornerTimes = [];
    };

    const game = new Game(segments, finalSegment, {
      onStart: () => {
        teardownAudio(); // §36: never let a previous run's nodes/timers survive
        const engine = startAudioEngine();
        audioEngine = engine;
        rhythmClock = createRhythmClock(engine.context, BPM, engine.startTime);
        cornerTimes = cornerBeats.map((beatIndex) => engine.startTime + beatIndex * SECONDS_PER_BEAT);
        sequencerHandle = startSequencer(engine, TEST_LEVEL, engine.startTime);
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

      if (wasPlaying && audioEngine && rhythmClock) {
        const engine = audioEngine;
        const grade: TimingGrade = getTimingGrade(getNearestBeatDistance(rhythmClock));
        applyTurnFeedback(
          feedback,
          { position: { x: playerBeforeToggle.x, z: playerBeforeToggle.z }, timingGrade: grade },
          (g) => playAccent(engine, g),
        );
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

      camera = updateCamera(camera, snapshot.player, feedback.cameraPulse);
      decayFeedback(feedback, dt);
      updateBackground(background, dt);

      const songTime = rhythmClock ? getSongTime(rhythmClock) : 0;
      const beatPulse = rhythmClock ? getBeatPulse(rhythmClock) : 0;

      render(ctx, canvas.clientWidth, canvas.clientHeight, {
        state: snapshot.state,
        segments,
        cornerTimes,
        songTime,
        player: snapshot.player,
        trail,
        camera,
        idlePhase: (now - idleClockStart) / 1000,
        fallProgress: snapshot.state === "falling" ? game.getEndedProgress() : 0,
        cubeScale: feedback.cubeScale,
        trailPulse: feedback.trailPulse,
        particles: feedback.particles,
        beatPulse,
        background,
        rhythmClock,
        lastGrade: feedback.lastGrade,
      });

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }
}
