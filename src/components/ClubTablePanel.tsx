import { useEffect, useState } from "react";
import { Pigeon } from "./Pigeon";
import type { Standing } from "../club/clubTable";
import { NAME_MAX } from "../club/identity";

/**
 * The club table, as a panel rather than a dialog of its own.
 *
 * Reading it needs nothing at all — no name, no sign-in — so anyone can see
 * where they would land before deciding to join. Joining is the only thing
 * that puts anything on a server, which is what lets the privacy policy say
 * nothing leaves the device unless you ask it to.
 *
 * The Supabase client arrives with the import below rather than with the page.
 * That does not make the tab the thing that fetches it: with a table
 * configured, `App` asks the same module for this device's name on its first
 * render, so the chunk is already on its way before anybody opens anything.
 * What the dynamic import buys is a build with no table configured, where the
 * chunk is never asked for at all.
 */
export function ClubTablePanel({
  name,
  onNameChanged,
}: {
  /** The name this device is already on the table under, if any. */
  name?: string;
  onNameChanged: (name?: string) => void;
}) {
  const [rows, setRows] = useState<Standing[] | undefined>();
  const [error, setError] = useState<string>();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
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
    <>
      <p className="dialog__lead">
        Points come from routes discovered, so nobody can farm the easy one.
      </p>

      {error && <p className="club-table__error">{error}</p>}

      {rows === undefined && !error && (
        <p className="help__note">Reading the book…</p>
      )}

      {rows && rows.length === 0 && (
        <p className="help__note club-table__empty">
          <Pigeon className="pigeon--table" />
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
    </>
  );
}
