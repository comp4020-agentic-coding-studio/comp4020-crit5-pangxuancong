import { TEST_LEVEL } from "./levels/testLevel";
import { DISTANCE_PER_BEAT } from "./utils/timing";
import { GAMEPLAY_CONFIG } from "./config/gameplay";
import { buildRoadSegments } from "./game/Road";
import { Game } from "./game/Game";
import { initialCamera, updateCamera } from "./game/Camera";
import { bindTrigger } from "./game/Input";
import { render } from "./rendering/Renderer";
import { startAudioEngine, stopAudioEngine, type AudioEngine } from "./audio/AudioEngine";
import { scheduleLevel } from "./audio/Sequencer";
import { playClick, playComplete, playFall } from "./audio/SoundEffects";

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

    let audioEngine: AudioEngine | null = null;
    let camera = initialCamera();
    let trail: { x: number; z: number }[] = [];
    let lastFrameTime = performance.now();
    const idleClockStart = performance.now();

    const game = new Game(segments, finalSegment, {
      onStart: () => {
        if (audioEngine) stopAudioEngine(audioEngine);
        audioEngine = startAudioEngine();
        scheduleLevel(audioEngine.context, audioEngine.startTime, TEST_LEVEL);
        trail = [];
      },
      onToggle: () => {
        if (audioEngine) playClick(audioEngine.context);
      },
      onFall: () => {
        if (audioEngine) playFall(audioEngine.context);
      },
      onComplete: () => {
        if (audioEngine) playComplete(audioEngine.context);
      },
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

    bindTrigger(canvas, () => game.trigger());

    const frame = (now: number): void => {
      const dt = Math.min(MAX_DT, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      const snapshot = game.step(dt);

      if (snapshot.state === "playing") {
        trail.push({ x: snapshot.player.x, z: snapshot.player.z });
        if (trail.length > MAX_TRAIL_POINTS) trail.shift();
      }

      camera = updateCamera(camera, snapshot.player);

      render(ctx, canvas.clientWidth, canvas.clientHeight, {
        state: snapshot.state,
        segments,
        player: snapshot.player,
        trail,
        camera,
        idlePhase: (now - idleClockStart) / 1000,
        fallProgress: snapshot.state === "falling" ? game.getEndedProgress() : 0,
      });

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }
}
