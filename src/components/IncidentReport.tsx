import { Pigeon } from "./Pigeon";
import type { IncidentReport as Report } from "../game/incidentReport";

const MARK: Record<string, string> = { good: "✓", bad: "✕" };

export function IncidentReportCard({ report }: { report: Report }) {
  return (
    <section className="report" aria-labelledby="report-heading">
      {/* A row rather than the pigeon pinned to the corner: the heading wraps
          on a narrow card, and pinned he would end up standing on it. */}
      <div className="report__masthead">
        <div>
          <p className="report__club">Wellesley Runners</p>
          <h3 id="report-heading" className="report__heading">
            Post Run Incident Report
          </h3>
        </div>
        <Pigeon className="pigeon--report" />
      </div>

      <dl className="report__lines">
        {report.lines.map((line) => (
          <div key={line.label} className={`report__line is-${line.tone}`}>
            <dt>{line.label}</dt>
            <dd>
              <span className="report__value">{line.value}</span>
              {MARK[line.tone] && (
                <span className="report__mark" aria-hidden="true">
                  {MARK[line.tone]}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="report__verdict">
        <span className="report__verdict-label">Overall</span>
        {report.verdict}
      </p>
    </section>
  );
}
