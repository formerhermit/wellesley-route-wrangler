import { Dialog } from "./Dialog";
import { IncidentReportCard } from "./IncidentReport";
import { ShareButton } from "./ShareButton";
import { SubmitToTable } from "./SubmitToTable";
import { buildRunShare } from "../game/shareText";
import type { IncidentReport } from "../game/incidentReport";
import type { RunScore } from "../game/scoring";
import type { GameResult, Level, Route } from "../game/types";

interface Props {
  level: Level;
  /** The route as run, for putting on the club table. */
  route: Route;
  clubName?: string;
  onJoinTable: () => void;
  result: GameResult;
  report: IncidentReport;
  /** What this run was worth, itemised. */
  score: RunScore;
  /** Whether the club had this route in the book already. */
  newRoute: boolean;
  found: number;
  toFind: number;
  clubPoints: number;
  /** The run this one has just opened up, if there is one. */
  nextLevel?: Level;
  /** Back to planning with the route intact, ready to be run again. */
  onEdit: () => void;
  /** Back to planning with nothing laid, to start the week afresh. */
  onStartOver: () => void;
  onNextLevel: () => void;
}

export function ResultPanel({
  level,
  route,
  clubName,
  onJoinTable,
  result,
  report,
  score,
  newRoute,
  found,
  toFind,
  clubPoints,
  nextLevel,
  onEdit,
  onStartOver,
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

      {score.won && (
        <div className="scorecard">
          <p className="scorecard__badge">
            {newRoute ? "New route for the book" : "Already in the book"}
          </p>
          <ul className="scorecard__lines">
            {score.lines.map((line) => (
              <li key={line.label}>
                <span>{line.label}</span>
                <span className="scorecard__points">
                  {newRoute ? `+${line.points}` : line.points}
                </span>
              </li>
            ))}
          </ul>
          <p className="scorecard__total">
            {newRoute
              ? `${score.points} club points banked.`
              : `Worth ${score.points}, but you have run this one before.`}{" "}
            <span className="scorecard__progress">
              {found} of {toFind} route{toFind === 1 ? "" : "s"} found here ·{" "}
              {clubPoints} points all told.
            </span>
          </p>
        </div>
      )}

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
        <button type="button" className="button" onClick={onStartOver}>
          Try Again
        </button>
      </div>

      {score.won && (
        <SubmitToTable
          level={level}
          route={route}
          name={clubName}
          onNeedsName={onJoinTable}
        />
      )}

      <div className="dialog__actions dialog__actions--secondary">
        <ShareButton
          payload={buildRunShare(level, result, report, {
            clubPoints,
            found,
            toFind,
          })}
          label="Share this run"
        />
      </div>
      <p className="dialog__actions-hint">
        Edit Route to make changes. Try Again to start over.
      </p>
    </Dialog>
  );
}
