import { useCallback, useEffect, useRef, useState } from "react";

/** Remembers whether the player wants sound effects, separately from music (#107). */
const SOUND_ON_KEY = "route-wrangler:sound-on";

function storedPreference(): boolean {
  try {
    return localStorage.getItem(SOUND_ON_KEY) === "1";
  } catch {
    // Storage blocked. Silence is the safer default here too.
    return false;
  }
}

function rememberPreference(on: boolean): void {
  try {
    localStorage.setItem(SOUND_ON_KEY, on ? "1" : "0");
  } catch {
    // Storage blocked; the preference simply lasts as long as the tab does.
  }
}

/** Every event a click in this game can make a noise for. */
export type SoundKind =
  | "select"
  | "undo"
  | "reject"
  | "run"
  | "success"
  | "fail"
  | "egg"
  | "reset"
  | "badge";

interface Note {
  freq: number;
  start: number;
  duration: number;
  type: OscillatorType;
  peak?: number;
  /** Slides the oscillator's pitch to here by the end of the note, for a
   * swoosh rather than a stepped tone — used once, for clearing the route. */
  sweepTo?: number;
}

/**
 * What each event sounds like, as a handful of notes on a shared oscillator
 * rather than a stack of audio files. `public/audio/` is licensed, original
 * music (see LICENSE-ASSETS.md) — a dozen tiny click-and-ding sounds is not
 * worth sourcing or clearing, and synthesising them means there is nothing to
 * licence and nothing to load.
 */
const SCRIPTS: Record<SoundKind, Note[]> = {
  select: [{ freq: 660, start: 0, duration: 0.05, type: "sine" }],
  undo: [{ freq: 330, start: 0, duration: 0.06, type: "sine" }],
  reject: [
    { freq: 140, start: 0, duration: 0.12, type: "square", peak: 0.15 },
  ],
  run: [
    { freq: 440, start: 0, duration: 0.08, type: "triangle" },
    { freq: 660, start: 0.08, duration: 0.12, type: "triangle" },
  ],
  success: [
    { freq: 523.25, start: 0, duration: 0.09, type: "triangle" },
    { freq: 659.25, start: 0.09, duration: 0.09, type: "triangle" },
    { freq: 783.99, start: 0.18, duration: 0.18, type: "triangle" },
  ],
  fail: [
    { freq: 392, start: 0, duration: 0.12, type: "sawtooth", peak: 0.12 },
    { freq: 293.66, start: 0.1, duration: 0.22, type: "sawtooth", peak: 0.12 },
  ],
  egg: [
    { freq: 880, start: 0, duration: 0.04, type: "square", peak: 0.1 },
    { freq: 1320, start: 0.04, duration: 0.05, type: "square", peak: 0.1 },
  ],
  reset: [
    { freq: 520, start: 0, duration: 0.16, type: "sine", sweepTo: 180 },
  ],
  badge: [
    { freq: 784, start: 0, duration: 0.07, type: "square", peak: 0.14 },
    { freq: 1046.5, start: 0.07, duration: 0.07, type: "square", peak: 0.14 },
    { freq: 1568, start: 0.14, duration: 0.16, type: "square", peak: 0.14 },
  ],
};

export interface SoundEffects {
  on: boolean;
  toggle: () => void;
  play: (kind: SoundKind) => void;
}

/**
 * Minor sound effects, off until asked for, independently of the music
 * (#107): clicking a junction, a rejected move, clearing the route, setting
 * off, the incident report's verdict, a badge landing on the wall, and the
 * things you can press (#104).
 *
 * Unlike `useMusic`, this never fights the autoplay wall — every `play` call
 * here happens inside the click or tap that asked for it, which is a user
 * gesture already, so the `AudioContext` is free to start the moment it
 * exists.
 */
export function useSoundEffects(): SoundEffects {
  const [on, setOn] = useState(storedPreference);
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(
    (kind: SoundKind) => {
      if (!on || typeof AudioContext === "undefined") return;

      // One context for the lifetime of the hook, created on the first sound
      // actually played rather than up front, so a player who leaves this off
      // never pays for it at all.
      let ctx = ctxRef.current;
      if (!ctx) {
        ctx = new AudioContext();
        ctxRef.current = ctx;
      }
      if (ctx.state === "suspended") void ctx.resume();

      const now = ctx.currentTime;
      for (const note of SCRIPTS[kind]) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = note.type;
        oscillator.frequency.value = note.freq;
        if (note.sweepTo !== undefined) {
          oscillator.frequency.linearRampToValueAtTime(
            note.sweepTo,
            now + note.start + note.duration,
          );
        }

        // A hard on/off click reads as a pop rather than a note, so every
        // note ramps up and back down instead of stepping.
        const peak = note.peak ?? 0.2;
        const noteStart = now + note.start;
        const noteEnd = noteStart + note.duration;
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(peak, noteStart + 0.01);
        gain.gain.linearRampToValueAtTime(0, noteEnd);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteEnd);
      }
    },
    [on],
  );

  // Nothing should keep the audio graph alive after the game has gone.
  useEffect(() => {
    return () => void ctxRef.current?.close();
  }, []);

  const toggle = useCallback(() => {
    setOn((current) => {
      rememberPreference(!current);
      return !current;
    });
  }, []);

  return { on, toggle, play };
}
