import { useCallback, useEffect, useRef, useState } from "react";

/** Remembers whether the player wants music. */
const MUSIC_ON_KEY = "route-wrangler:music-on";

/**
 * Loud enough to notice, quiet enough to plan a route over. The tracks are
 * mastered at a normal level, so this is doing real work.
 */
const VOLUME = 0.35;

function storedPreference(): boolean {
  try {
    return localStorage.getItem(MUSIC_ON_KEY) === "1";
  } catch {
    // Storage blocked. Silence is the safer default for something that makes
    // a noise on its own.
    return false;
  }
}

function rememberPreference(on: boolean): void {
  try {
    localStorage.setItem(MUSIC_ON_KEY, on ? "1" : "0");
  } catch {
    // Storage blocked; the preference simply lasts as long as the tab does.
  }
}

export interface Music {
  on: boolean;
  toggle: () => void;
}

/**
 * Background music, off until asked for. Browsers refuse to play audio before
 * the page has been interacted with, so a returning player who left it on gets
 * playback on their first click or key press rather than a promise rejection
 * on load.
 *
 * `src` is a parameter rather than a constant so a level can bring its own
 * track later: changing it swaps the audio without disturbing the preference.
 */
export function useMusic(src: string): Music {
  const [on, setOn] = useState(storedPreference);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // One element for the lifetime of the hook, so toggling off and on again
  // resumes rather than re-downloading the track.
  if (audioRef.current === null && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = VOLUME;
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.getAttribute("src") === src) return;
    audio.src = src;
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!on) {
      audio.pause();
      return;
    }

    // Rejects when the page has not been interacted with yet. Not an error
    // worth surfacing: the gesture listener below picks it up.
    void audio.play().catch(() => undefined);
  }, [on, src]);

  // The preference survives a reload, but autoplay does not. Wait for any
  // gesture, then start.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !on || !audio.paused) return;

    const start = () => void audio.play().catch(() => undefined);
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, [on]);

  // Nothing should keep playing after the game has gone.
  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  const toggle = useCallback(() => {
    setOn((current) => {
      rememberPreference(!current);
      return !current;
    });
  }, []);

  return { on, toggle };
}
