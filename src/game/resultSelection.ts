import { fillCopy } from "./routeEvaluation";
import type {
  GameResult,
  Level,
  ObjectiveKind,
  RouteEvaluation,
} from "./types";

/**
 * Which failure gets to name the result when several apply. Fixed here rather
 * than taken from the level's checklist order, so the choice stays
 * deterministic however a level chooses to present its objectives.
 */
type FailureSlot = ObjectiveKind | "stranded";

const FAILURE_PRIORITY: FailureSlot[] = [
  "avoid-closed",
  "no-repeat",
  "max-node-type",
  "avoid-surface",
  "visit",
  // Below the summits it is named for. Missing Crooksbury Hill and being two
  // climbs short are the same mistake, and the one with a place in it says
  // more about what went wrong than a number does.
  "climb",
  // Stopping at the canal outranks any quibble about the distance.
  "stranded",
  "distance",
  "finish",
  "start",
];

export function selectResult(
  level: Level,
  evaluation: RouteEvaluation,
): GameResult {
  const km = evaluation.totalDistanceKm;

  if (evaluation.success) {
    return { ...fillCopy(level.success, km), success: true };
  }

  if (evaluation.isEmpty) {
    return { ...fillCopy(level.emptyRoute, km), success: false };
  }

  // The run has been run, so nothing is undecided any more: an objective still
  // sitting at "incomplete" — an unvisited canal, a route that came up short —
  // has conclusively failed by now.
  for (const slot of FAILURE_PRIORITY) {
    if (slot === "stranded") {
      // Stopped somewhere it was only meant to pass through.
      if (evaluation.stranded) {
        return { ...evaluation.stranded, success: false };
      }
      continue;
    }

    const failed = evaluation.objectives.find(
      (objective) => objective.kind === slot && objective.state !== "passed",
    );
    if (failed?.fail) return { ...failed.fail, success: false };
  }

  return { ...fillCopy(level.fallback, km), success: false };
}
