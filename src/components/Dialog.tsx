import { useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";

interface Props {
  /** Id of the heading inside; it names the dialog and takes initial focus. */
  titleId: string;
  describedBy?: string;
  /** "alertdialog" for something the player did not ask to see. */
  role?: "dialog" | "alertdialog";
  className?: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The shared modal shell: backdrop, dialog semantics, Escape to close, and
 * initial focus. The page behind is made inert by App, so focus cannot wander
 * out of here.
 */
export function Dialog({
  titleId,
  describedBy,
  role = "dialog",
  className = "",
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
        {children}
      </div>
    </div>
  );
}
