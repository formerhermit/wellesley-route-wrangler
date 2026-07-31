import { useEffect, useId, useRef, useState } from "react";
import { payloadToClipboard } from "../game/shareText";
import { shareLinksFor } from "../game/shareLinks";
import type { SharePayload } from "../game/shareText";

interface Props {
  payload: SharePayload;
  label: string;
  className?: string;
}

/**
 * On a phone the native share sheet is the right answer — it is the only route
 * to Instagram and WhatsApp. Desktops either have no share sheet at all, or a
 * macOS one with no social networks in it, so there we open our own menu of
 * share links instead.
 */
export function ShareButton({ payload, label, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const copiedTimer = useRef<number | null>(null);
  const menuId = useId();
  const links = shareLinksFor(payload);

  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) clearTimeout(copiedTimer.current);
    };
  }, []);

  // Close on Escape, or on a click anywhere outside the menu.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(payloadToClipboard(payload));
      setCopied(true);
      if (copiedTimer.current !== null) clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        // A cancelled share sheet is not a failure worth reporting.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setOpen((wasOpen) => !wasOpen);
  };

  return (
    <div className="share" ref={wrapperRef}>
      <button
        type="button"
        ref={buttonRef}
        className={`button ${className}`}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => void onShareClick()}
      >
        {copied ? "Link copied!" : label}
      </button>

      {open && (
        <div className="share__menu" id={menuId}>
          <p className="share__menu-heading">Share to</p>
          {links.map((link) => (
            <a
              key={link.id}
              className="share__option"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            className="share__option share__option--copy"
            onClick={() => void copyLink()}
          >
            Copy link
          </button>
        </div>
      )}

      <span role="status" aria-live="polite" className="visually-hidden">
        {copied ? "Link copied to the clipboard." : ""}
      </span>
    </div>
  );
}
