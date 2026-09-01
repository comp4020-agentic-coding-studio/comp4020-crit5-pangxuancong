import { BEAT_DURATION } from "./clock";
import { TRACK } from "./track";

// A simplified, self-synthesized rendition of the Pachelbel Canon in D
// ostinato — not a transcription of a recorded performance, so there is no
// audio asset to license, and every note is deterministic data the track
// timing can be derived from directly (see track.ts's corner beats below).
const BASS_MIDI = [50, 57, 59, 54, 55, 50, 55, 57]; // D3 A3 B3 F#3 G3 D3 G3 A3

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playNote(
  audioContext: AudioContext,
  frequency: number,
  time: number,
  duration: number,
  type: OscillatorType,
  peakGain: number,
): void {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(peakGain, time + 0.01);
  gain.gain.linearRampToValueAtTime(0, time + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.05);
}

// Schedules the whole run's audio up front against absolute AudioContext
// time, starting at `startTime`. The bass ostinato carries every beat; a
// melodic accent note doubles as the audible half of the corner cue, sounding
// exactly when a click is due — the visual and audio warnings are the same
// event, not two clocks to keep in sync by hand.
export function scheduleCanon(audioContext: AudioContext, startTime: number): void {
  TRACK.forEach((step, index) => {
    const time = startTime + index * BEAT_DURATION;
    const bassNote = BASS_MIDI[index % BASS_MIDI.length];
    playNote(audioContext, midiToFrequency(bassNote), time, BEAT_DURATION * 0.9, "triangle", 0.12);

    if (step.corner) {
      const accentNote = bassNote + 12 + [0, 4, 7][index % 3];
      playNote(audioContext, midiToFrequency(accentNote), time, BEAT_DURATION * 0.6, "sine", 0.1);
    }
  });
}
