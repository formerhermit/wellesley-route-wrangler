import { useEffect, useState } from "react";
import { Dialog } from "./Dialog";
import type { Standing } from "../club/clubTable";
import { NAME_MAX } from "../club/identity";

interface Props {
  /** The name this device is already on the table under, if any. */
  name?: string;
  onNameChanged: (name?: string) => void;
  onClose: () => void;
}

/**
 * The club table. Reading it needs nothing at all — no name, no sign-in — so
 * anyone can see where they would land before deciding to join. Joining is the
 * only thing that puts anything on a server, which is what lets the privacy
 * policy say nothing leaves the device unless you ask it to.
 */
export function ClubTableDialog({ name, onNameChanged, onClose }: Props) {
  const [rows, setRows] = useState<Standing[] | undefined>();
  const [error, setError] = useState<string>();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    // The Supabase client arrives with this import, not with the page.
    void import("../club/clubTable")
      .then(({ standings }) => standings())
      .then((result) => {
        if (!live) return;
        if (result.ok) setRows(result.data ?? []);
        else setError(result.error);
      });
    return () => {
      live = false;
    };
  }, [name]);

  const join = async () => {
    setBusy(true);
    setError(undefined);
    const { joinTable } = await import("../club/clubTable");
    const result = await joinTable(typed);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTyped("");
    onNameChanged(result.data);
  };

  const leave = async () => {
    setBusy(true);
    setError(undefined);
    const { removeMe } = await import("../club/clubTable");
    const result = await removeMe();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onNameChanged(undefined);
  };

  return (
    <Dialog titleId="club-title" describedBy="club-intro" onClose={onClose}>
      <p className="dialog__badge">Wellesley Runners</p>
      <h2 id="club-title" tabIndex={-1}>
        The club table
      </h2>
      <p id="club-intro" className="dialog__lead">
        Points come from routes discovered, so nobody can farm the easy one.
      </p>

      {error && <p className="club-table__error">{error}</p>}

      {rows === undefined && !error && (
        <p className="help__note">Reading the book…</p>
      )}

      {rows && rows.length === 0 && (
        <p className="help__note">
          Nobody on it yet. Somebody has to go first.
        </p>
      )}

      {rows && rows.length > 0 && (
        <ol className="club-table">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className={`club-table__row${
                row.displayName === name ? " club-table__row--you" : ""
              }`}
            >
              <span className="club-table__place">{index + 1}</span>
              <span className="club-table__name">{row.displayName}</span>
              <span className="club-table__routes">
                {row.routesFound} route{row.routesFound === 1 ? "" : "s"}
              </span>
              <span className="club-table__points">{row.points}</span>
            </li>
          ))}
        </ol>
      )}

      {name ? (
        <>
          <p className="help__note">
            You are on the table as <strong>{name}</strong>.
          </p>
          <div className="dialog__actions dialog__actions--secondary">
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => void leave()}
            >
              Remove me from the table
            </button>
          </div>
        </>
      ) : (
        <div className="club-join">
          <label className="club-join__label" htmlFor="club-name">
            Put yourself on it
          </label>
          <div className="club-join__row">
            <input
              id="club-name"
              className="club-join__input"
              value={typed}
              maxLength={NAME_MAX}
              placeholder="A name people will see"
              onChange={(event) => setTyped(event.target.value)}
            />
            <button
              type="button"
              className="button button--primary"
              disabled={busy || typed.trim().length === 0}
              onClick={() => void join()}
            >
              Join
            </button>
          </div>
        </div>
      )}

      <div className="dialog__actions">
        <button type="button" className="button" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}
