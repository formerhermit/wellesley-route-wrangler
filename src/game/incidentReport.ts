import { roadById } from "./routeGraph";
import { countNodeType, countSurface, usedClosedRoad } from "./routeEvaluation";
import type { Level, Route, RouteEvaluation } from "./types";

export interface ReportLine {
  label: string;
  value: string;
  /** Drives the tick, cross or plain number, and its colour. */
  tone: "good" | "bad" | "neutral";
}

export interface IncidentReport {
  lines: ReportLine[];
  verdict: string;
}

/**
 * How many pigeons the group claims to have seen. Derived from the roads
 * actually taken so it is deterministic and rises with exposure — the club
 * would never simply make a number up.
 */
export function pigeonsSighted(level: Level, route: Route): number {
  const fromRoads = route.roadIds.reduce(
    (total, id) => total + Math.round((roadById(level, id).pigeonRisk ?? 0) * 9),
    0,
  );
  return fromRoads + countNodeType(level, route, "pigeon") * 6;
}

export function unnecessaryHills(level: Level, route: Route): number {
  return route.roadIds.filter((id) => roadById(level, id).hill === true).length;
}

export function closedRoadsIgnored(level: Level, route: Route): number {
  return route.roadIds.filter((id) => roadById(level, id).closed === true)
    .length;
}

/** One complaint per objective the group failed to satisfy. */
export function committeeComplaints(evaluation: RouteEvaluation): number {
  return evaluation.objectives.filter((o) => o.state !== "passed").length;
}

const VERDICTS = [
  "Surprisingly competent.",
  "Broadly acceptable.",
  "Questions will be asked.",
  "The committee will be in touch.",
];

export function verdictFor(
  evaluation: RouteEvaluation,
  complaints: number,
): string {
  if (evaluation.isEmpty) return "No run appears to have taken place.";
  if (evaluation.success) return VERDICTS[0];
  return VERDICTS[Math.min(complaints, VERDICTS.length - 1)];
}

function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function tick(passed: boolean): ReportLine["tone"] {
  return passed ? "good" : "bad";
}

/**
 * The club's post-run paperwork. Built from the route and the level's own
 * objectives, so a new level reports on whatever it happens to care about.
 */
export function buildIncidentReport(
  level: Level,
  route: Route,
  evaluation: RouteEvaluation,
): IncidentReport {
  const lines: ReportLine[] = [];

  const distance = evaluation.objectives.find((o) => o.kind === "distance");
  lines.push({
    label: "Distance",
    value: `${evaluation.totalDistanceKm.toFixed(2)} km`,
    tone: distance ? tick(distance.state === "passed") : "neutral",
  });

  lines.push({
    label: "Nobody forgotten",
    value: evaluation.endsAtFinish ? "Yes" : "No",
    tone: tick(evaluation.endsAtFinish),
  });

  // evaluateRoute returns one result per declared objective, in order, so
  // pair them by index — matching on kind alone reports the first "visit"
  // objective's state for every one of them.
  level.objectives.forEach((objective, index) => {
    if (objective.kind !== "visit") return;
    const visited = evaluation.objectives[index]?.state === "passed";
    lines.push({
      label:
        objective.reportLabel ??
        sentenceCase(`${objective.what.replace(/^the /, "")} visited`),
      value: visited ? "Yes" : "No",
      tone: tick(visited),
    });
  });

  lines.push({
    label: "Unexpected pigeons",
    value: String(pigeonsSighted(level, route)),
    tone: "neutral",
  });

  const hills = unnecessaryHills(level, route);
  if (hills > 0) {
    lines.push({
      label: "Unnecessary hills",
      value: String(hills),
      tone: "neutral",
    });
  }

  if (level.objectives.some((o) => o.kind === "avoid-surface")) {
    const surface = level.objectives.find((o) => o.kind === "avoid-surface");
    if (surface?.kind === "avoid-surface") {
      const count = countSurface(level, route, surface.surface);
      lines.push({
        label: sentenceCase(`${surface.what.replace(/^the /, "")} stretches`),
        value: String(count),
        tone: count > 0 ? "bad" : "good",
      });
    }
  }

  if (level.objectives.some((o) => o.kind === "avoid-closed")) {
    lines.push({
      label: "Closed paths ignored",
      value: String(closedRoadsIgnored(level, route)),
      tone: usedClosedRoad(level, route) ? "bad" : "good",
    });
  }

  const complaints = committeeComplaints(evaluation);
  lines.push({
    label: "Committee complaints",
    value: String(complaints),
    tone: complaints > 0 ? "bad" : "good",
  });

  return { lines, verdict: verdictFor(evaluation, complaints) };
}
