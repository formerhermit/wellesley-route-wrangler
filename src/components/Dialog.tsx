import { useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";

interface Props {
  /** Id of the heading inside; it names the dialog and takes initial focus. */
  titleId: string;
  describedBy?: string;
  /** "alertdialog" for something the player did not ask to see. */
  role?: "dialog" | "alertdialog";
  className?: string;
  /**
   * What the X closes, as a screen reader should hear it: "Close the book",
   * "Close how to play". Required rather than defaulted to "Close", because a
   * page with six identically named buttons on it has named none of them.
   */
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The shared modal shell: backdrop, dialog semantics, Escape to close, initial
 * focus, and the X in the corner. The page behind is made inert by App, so
 * focus cannot wander out of here.
 *
 * The X lives here rather than in each dialog (#96). It started as the rules
 * screen's own, which is how every other dialog came to have no way out but a
 * button at the bottom of a page you might have to scroll to reach.
 */
export function Dialog({
  titleId,
  describedBy,
  role = "dialog",
  className = "",
  closeLabel,
  onClose,
  children,
}: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.getElementById(titleId)?.focus();
  }, [titleId]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    }
  };

  return (
    <div
      className="dialog-backdrop"
      ref={backdropRef}
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => {
        if (event.target === backdropRef.current) onClose();
      }}
    >
      <div
        className={`dialog ${className}`}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
      >
        {/*
          A sticky row of no height, rather than an absolutely positioned
          button. The dialog is its own scrolling box, so absolute would pin
          the X to the top of the content and let it scroll away — on the
          privacy policy, which is twice the height of a phone, that is exactly
          where you would go looking for it. Zero height keeps it out of the
          flow, so it floats over the corner as drawn.
        */}
        <div className="dialog__close-row">
          <button
            type="button"
            className="dialog__close"
            onClick={onClose}
            aria-label={`Close ${closeLabel}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M7 7l10 10M17 7L7 17" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
