import { Dialog } from "./Dialog";
import { IncidentReportCard } from "./IncidentReport";
import { ShareButton } from "./ShareButton";
import { buildRunShare } from "../game/shareText";
import type { IncidentReport } from "../game/incidentReport";
import type { GameResult, Level } from "../game/types";

interface Props {
  level: Level;
  result: GameResult;
  report: IncidentReport;
  /** The run this one has just opened up, if there is one. */
  nextLevel?: Level;
  onEdit: () => void;
  onTryAgain: () => void;
  onReset: () => void;
  onNextLevel: () => void;
}

export function ResultPanel({
  level,
  result,
  report,
  nextLevel,
  onEdit,
  onTryAgain,
  onReset,
  onNextLevel,
}: Props) {
  const advancing = result.success && nextLevel !== undefined;
  return (
    <Dialog
      titleId="result-title"
      describedBy="result-message"
      role="alertdialog"
      className={result.success ? "dialog--success" : "dialog--failure"}
      onClose={onEdit}
    >
      <p className="dialog__badge">
        {result.success ? "Club record attempt" : "Post-run debrief"}
      </p>
      <h2 id="result-title" tabIndex={-1}>
        {result.title}
      </h2>
      <p id="result-message" className="dialog__lead">
        {result.message}
      </p>

      <IncidentReportCard report={report} />

      {result.success && (
        <p className="dialog__unlock">
          {nextLevel
            ? `That is this one in the bag. ${nextLevel.title} is now open.`
            : "That is the whole fixture list run. The committee is speechless."}
        </p>
      )}

      <div className="dialog__actions">
        {advancing && (
          <button
            type="button"
            className="button button--primary"
            onClick={onNextLevel}
          >
            Next Run
          </button>
        )}
        <button
          type="button"
          className={`button${advancing ? "" : " button--primary"}`}
          onClick={onEdit}
        >
          Edit Route
        </button>
        <button type="button" className="button" onClick={onTryAgain}>
          Try Again
        </button>
        <button type="button" className="button" onClick={onReset}>
          Reset Route
        </button>
      </div>

      <div className="dialog__actions dialog__actions--secondary">
        <ShareButton
          payload={buildRunShare(level, result, report)}
          label="Share this run"
        />
      </div>
      <p className="dialog__actions-hint">
        Edit Route keeps what you planned · Try Again replays it · Reset Route
        clears it.
      </p>
    </Dialog>
  );
}
