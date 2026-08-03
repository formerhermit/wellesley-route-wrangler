import { useRef, useState } from "react";
import { Dialog } from "./Dialog";
import { ClubTablePanel } from "./ClubTablePanel";
import { TrophyCabinetPanel } from "./TrophyCabinetPanel";
import type { Records } from "../game/records";
import type { Level } from "../game/types";

type Tab = "cabinet" | "table";

/**
 * Everything about the club in one place: what it has won, and where it stands.
 *
 * These belong together and belonged nowhere before. The cabinet had a line of
 * its own under the objective panel, which is the wrong home twice over — that
 * panel is about the run in front of you, and a second link under the run
 * book's made the corner look like a list of doors.
 *
 * So: one button in the header, one dialog, two tabs. The book stays where it
 * was, because the book *is* about the run in front of you.
 */
export function ClubDialog({
  levels,
  records,
  tableEnabled,
  name,
  onNameChanged,
  onClose,
}: {
  levels: Level[];
  records: Records;
  /** Without a table configured there is one tab, and no tab strip. */
  tableEnabled: boolean;
  name?: string;
  onNameChanged: (name?: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("cabinet");
  const tabsRef = useRef<HTMLDivElement>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: "cabinet", label: "Trophy cabinet" },
    ...(tableEnabled ? [{ id: "table" as Tab, label: "Club table" }] : []),
  ];

  /* Left and right move between tabs, which is what a tab strip promises by
     calling itself one. */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const at = tabs.findIndex((t) => t.id === tab);
    const next = tabs[(at + step + tabs.length) % tabs.length];
    setTab(next.id);
    tabsRef.current
      ?.querySelector<HTMLButtonElement>(`#club-tab-${next.id}`)
      ?.focus();
  };

  return (
    <Dialog titleId="club-title" closeLabel="the club" onClose={onClose}>
      <p className="dialog__badge">Wellesley Runners</p>
      <h2 id="club-title" tabIndex={-1}>
        The club
      </h2>

      {tabs.length > 1 && (
        <div
          className="tabs"
          role="tablist"
          aria-label="The club"
          ref={tabsRef}
          onKeyDown={onKeyDown}
        >
          {tabs.map((each) => (
            <button
              key={each.id}
              type="button"
              id={`club-tab-${each.id}`}
              role="tab"
              className={`tabs__tab${tab === each.id ? " tabs__tab--on" : ""}`}
              aria-selected={tab === each.id}
              aria-controls={`club-panel-${each.id}`}
              tabIndex={tab === each.id ? 0 : -1}
              onClick={() => setTab(each.id)}
            >
              {each.label}
            </button>
          ))}
        </div>
      )}

      <div
        id={`club-panel-${tab}`}
        role={tabs.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={tabs.length > 1 ? `club-tab-${tab}` : undefined}
        tabIndex={-1}
      >
        {tab === "cabinet" ? (
          <TrophyCabinetPanel levels={levels} records={records} />
        ) : (
          <ClubTablePanel name={name} onNameChanged={onNameChanged} />
        )}
      </div>

      <div className="dialog__actions">
        <button type="button" className="button button--primary" onClick={onClose}>
          Back to the map
        </button>
      </div>
    </Dialog>
  );
}
