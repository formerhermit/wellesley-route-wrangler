import { roadById, routePoints } from "./routeGraph";
import type { Level, Route } from "./types";

/**
 * How much of its flat speed the group keeps on a hill. The run still takes
 * the same eight seconds whatever the route, so a climb costs the flat legs
 * their time rather than making the whole thing longer — which is what
 * slowing down looks like from above.
 */
const HILL_SPEED = 0.55;

/**
 * What a stop costs, as a share of the whole route's length: standing still
 * here takes as much of the clock as running an eighth of the route does.
 *
 * Expressed against the route rather than in milliseconds because the run is
 * always the same eight seconds however long the route is — a stop has to be
 * a share of the clock, not a slice off the end of it. It is also pleasantly
 * self-limiting: three stops on one run each take about a fifth less of it
 * than one stop would, which is the right way round. A run with a lot of
 * interruptions is a run of brief ones.
 */
const STOP_SHARE = 0.125;

export interface Pace {
  /**
   * How far round the route the group is, 0 to 1, having spent `effort` of
   * the run. Time is linear in effort; distance is not, which is the point.
   */
  fractionAt: (effort: number) => number;
  /** Whether any of it is uphill. Flat routes skip the arithmetic. */
  hilly: boolean;
  /** How many times the group stands still on the way round. Usually none. */
  stops: number;
}

const FLAT: Pace = { fractionAt: (effort) => effort, hilly: false, stops: 0 };

/**
 * The run, leg by leg, with the hills costing more time than their length.
 *
 * Measured on the straight lines between junctions rather than the drawn
 * path — the same approximation the pigeon milestones already make. A leg
 * that curves around a building is a little longer than the line between its
 * ends, and at this scale nobody has ever noticed.
 *
 * `stopAt` names junctions the group stands still at on the way round: the
 * cows, a red light, somebody taking a photograph. A stop is modelled as a
 * leg of no length and real cost, which is the same trick a hill uses one
 * step further — a hill is expensive ground, a stop is ground that does not
 * move at all. Everything downstream reads its position off this one curve,
 * so the group, whatever is following it and the whole of a race field stop
 * together and set off together without any of them being told about it.
 */
export function paceOf(
  level: Level,
  route: Route,
  stopAt: readonly string[] = [],
): Pace {
  const points = routePoints(level, route);
  if (points.length < 2) return FLAT;

  const stops = stopAt.length > 0 ? new Set(stopAt) : null;
  const travel: { length: number; cost: number; stopAfter: boolean }[] = [];
  let hilly = false;

  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const length = Math.hypot(dx, dy);
    const hill = roadById(level, route.roadIds[i - 1]).hill === true;
    if (hill) hilly = true;
    travel.push({
      length,
      cost: length / (hill ? HILL_SPEED : 1),
      /*
       * Interior junctions only. A stop on the start line is a group that
       * has not set off yet and a stop on the finish line delays nothing —
       * and since every route here is a loop, those are the same junction,
       * so this is also what stops the start counting itself twice.
       */
      stopAfter:
        stops !== null && i < points.length - 1 && stops.has(points[i].id),
    });
  }

  const totalLength = travel.reduce((sum, leg) => sum + leg.length, 0);
  const stopCost = totalLength * STOP_SHARE;

  const legs: { length: number; cost: number }[] = [];
  let stopCount = 0;
  for (const leg of travel) {
    legs.push({ length: leg.length, cost: leg.cost });
    if (leg.stopAfter) {
      legs.push({ length: 0, cost: stopCost });
      stopCount += 1;
    }
  }

  const totalCost = legs.reduce((sum, leg) => sum + leg.cost, 0);
  if ((!hilly && stopCount === 0) || totalLength === 0 || totalCost === 0) {
    return FLAT;
  }

  return {
    hilly,
    stops: stopCount,
    fractionAt: (effort: number) => {
      let spent = Math.min(Math.max(effort, 0), 1) * totalCost;
      let travelled = 0;
      for (const leg of legs) {
        if (spent <= leg.cost) {
          return (travelled + leg.length * (spent / leg.cost)) / totalLength;
        }
        spent -= leg.cost;
        travelled += leg.length;
      }
      return 1;
    },
  };
}
