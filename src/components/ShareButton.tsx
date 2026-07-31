import { useEffect, useRef, useState } from "react";
import { payloadToClipboard } from "../game/shareText";
import type { SharePayload } from "../game/shareText";

type Status = "idle" | "copied" | "failed";

interface Props {
  payload: SharePayload;
  label: string;
  className?: string;
}

/**
 * Uses the native share sheet where there is one — which is how a phone
 * reaches Instagram, WhatsApp and the rest — and falls back to putting the
 * text on the clipboard everywhere else.
 */
export function ShareButton({ payload, label, className = "" }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  const flash = (next: Status) => {
    setStatus(next);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 2500);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        // A cancelled share sheet is not a failure worth reporting.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(payloadToClipboard(payload));
      flash("copied");
    } catch {
      flash("failed");
    }
  };

  return (
    <>
      <button
        type="button"
        className={`button ${className}`}
        onClick={() => void share()}
      >
        {status === "copied"
          ? "Copied!"
          : status === "failed"
            ? "Could not share"
            : label}
      </button>
      <span role="status" aria-live="polite" className="visually-hidden">
        {status === "copied"
          ? "Link copied to the clipboard."
          : status === "failed"
            ? "Sharing is not available on this device."
            : ""}
      </span>
    </>
  );
}
