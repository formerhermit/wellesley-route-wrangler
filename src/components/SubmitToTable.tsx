import { useState } from "react";
import { clubTableEnabled } from "../club/enabled";
import type { Level, Route } from "../game/types";

/**
 * Offered on a winning run, and only when there is a table to put it on.
 * Sends the route — never a score — and shows what came back, which is the
 * number the server worked out for itself.
 */
export function SubmitToTable({
  level,
  route,
  name,
  onNeedsName,
}: {
  level: Level;
  route: Route;
  /** The name this device plays under, if it has joined. */
  name?: string;
  onNeedsName: () => void;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string>();

  if (!clubTableEnabled) return null;

  if (!name) {
    return (
      <p className="submit-table">
        <button type="button" className="link-button" onClick={onNeedsName}>
          Put this on the club table
        </button>
      </p>
    );
  }

  if (state === "done") {
    return <p className="submit-table">On the table, under {name}.</p>;
  }

  const send = async () => {
    setState("sending");
    setError(undefined);
    const { submitRun } = await import("../club/clubTable");
    const result = await submitRun(level.id, route.roadIds);
    if (result.ok) {
      setState("done");
      return;
    }
    setState("idle");
    setError(result.error);
  };

  return (
    <p className="submit-table">
      <button
        type="button"
        className="link-button"
        disabled={state === "sending"}
        onClick={() => void send()}
      >
        {state === "sending" ? "Sending…" : "Put this on the club table"}
      </button>
      {error && <span className="submit-table__error"> {error}</span>}
    </p>
  );
}
