import type { GameResult, Level, RouteEvaluation } from "./types";

/**
 * Deterministic: the first failing condition in this order names the result.
 * Kept out of the components so it can be tested on its own.
 */
export function selectResult(
  level: Level,
  evaluation: RouteEvaluation,
): GameResult {
  if (evaluation.success) {
    return {
      title: "Perfect Social Run",
      message:
        "Bang on distance, canal duly admired, and only one pigeon incident. The club WhatsApp will be insufferable about this for a fortnight.",
      success: true,
    };
  }

  if (evaluation.isEmpty) {
    return {
      title: "Barely Left the Start Line",
      message:
        "Everyone stood outside the Observatory discussing trainers for forty minutes, then went home.",
      success: false,
    };
  }

  if (evaluation.usedClosedRoad) {
    return {
      title: "The Closed Road Was, In Fact, Closed",
      message:
        "The barrier was not a suggestion. Fifteen runners are now doing a three-point turn in front of a man with a clipboard.",
      success: false,
    };
  }

  if (evaluation.hasRepeatedRoad) {
    return {
      title: "Everyone Returned Eventually",
      message:
        "You sent the group up and down the same stretch until somebody's watch gave up and somebody else pretended to have a hamstring.",
      success: false,
    };
  }

  if (evaluation.pigeonHotspotCount > level.maxPigeonHotspots) {
    return {
      title: "Pigeon-Controlled Route",
      message:
        "Two hotspots. Two. The pigeons have taken the front three runners hostage and are negotiating for the flapjacks.",
      success: false,
    };
  }

  if (!evaluation.visitedCheckpoint) {
    return {
      title: "Nobody Visited the Canal",
      message:
        "The route committee are furious. The canal is the entire point of a Thursday. There will be an email.",
      success: false,
    };
  }

  if (evaluation.endsAtCheckpoint) {
    return {
      title: "Nobody Left the Canal",
      message:
        "They reached the towpath, admired a narrowboat called Vitamin Sea, and simply never came back.",
      success: false,
    };
  }

  if (evaluation.totalDistanceKm > level.maxDistanceKm) {
    return {
      title: "Accidental Long Run",
      message: `${evaluation.totalDistanceKm.toFixed(
        2,
      )} km on a social Thursday. Three people have gone quiet and one has started talking about a marathon.`,
      success: false,
    };
  }

  if (evaluation.totalDistanceKm < level.minDistanceKm) {
    return {
      title: "An Innovative Definition of 5K",
      message: `${evaluation.totalDistanceKm.toFixed(
        2,
      )} km, generously measured. The pace was superb, which is the sort of thing people say about a short run.`,
      success: false,
    };
  }

  return {
    title: "Everyone Returned Eventually",
    message:
      "Something went awry out there, but the group is back, damp and cheerful, and nobody wants to discuss it.",
    success: false,
  };
}
