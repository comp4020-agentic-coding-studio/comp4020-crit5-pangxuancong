import { LEVEL_01 } from "./levels/level01";
import { DISTANCE_PER_BEAT } from "./utils/timing";
import { Game } from "./game/Game";
import { buildPathPoints } from "./game/Path";
import { playerDirection, playerPosition } from "./game/Player";
import { initialCamera, updateCamera } from "./game/Camera";
import { bindTrigger } from "./game/Input";
import { render } from "./rendering/Renderer";
import { PULSE_LIFETIME, type Pulse } from "./rendering/Effects";
import { startAudioEngine, stopAudioEngine, type AudioEngine } from "./audio/AudioEngine";
import { scheduleLevel } from "./audio/Sequencer";
import { playComplete, playFall, playTurnSuccess } from "./audio/SoundEffects";

const MAX_DT = 1 / 20; // clamp large frame gaps (e.g. tab switching) — PLAN.md §25

const canvasElement = document.querySelector<HTMLCanvasElement>("#game");
if (canvasElement) {
  const canvas = canvasElement;
  const context2d = canvas.getContext("2d");
  if (context2d) {
    const ctx = context2d;
    const pathPoints = buildPathPoints(LEVEL_01, DISTANCE_PER_BEAT);

    let audioEngine: AudioEngine | null = null;
    let camera = initialCamera();
    let pulses: Pulse[] = [];
    let lastFrameTime = performance.now();
    const idleClockStart = performance.now();

    const game = new Game(LEVEL_01, DISTANCE_PER_BEAT, {
      onStart: () => {
        if (audioEngine) stopAudioEngine(audioEngine);
        audioEngine = startAudioEngine();
        scheduleLevel(audioEngine.context, audioEngine.startTime, LEVEL_01);
      },
      onTurnSuccess: () => {
        if (audioEngine) playTurnSuccess(audioEngine.context);
        const position = playerPosition(game.getPlayer(), pathPoints);
        pulses.push({ x: position.x, y: position.y, age: 0 });
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
      const position = playerPosition(snapshot.player, pathPoints);
      const direction = playerDirection(snapshot.player);
      camera = updateCamera(camera, position.x, position.y, direction);

      pulses = pulses
        .map((pulse) => ({ ...pulse, age: pulse.age + dt }))
        .filter((pulse) => pulse.age < PULSE_LIFETIME);

      render(ctx, canvas.clientWidth, canvas.clientHeight, {
        state: snapshot.state,
        level: LEVEL_01,
        pathPoints,
        distancePerBeat: DISTANCE_PER_BEAT,
        segmentIndex: snapshot.player.segmentIndex,
        distanceIntoSegment: snapshot.player.distanceIntoSegment,
        playerX: position.x,
        playerY: position.y,
        camera,
        idlePhase: (now - idleClockStart) / 1000,
        fallProgress: snapshot.state === "falling" ? game.getEndedProgress() : 0,
        pulses,
      });

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }
}
