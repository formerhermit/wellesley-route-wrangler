import { roadById, routePoints } from "./routeGraph";
import type { Level, Route } from "./types";

/**
 * How much of its flat speed the group keeps on a hill. The run still takes
 * the same eight seconds whatever the route, so a climb costs the flat legs
 * their time rather than making the whole thing longer — which is what
 * slowing down looks like from above.
 */
const HILL_SPEED = 0.55;

export interface Pace {
  /**
   * How far round the route the group is, 0 to 1, having spent `effort` of
   * the run. Time is linear in effort; distance is not, which is the point.
   */
  fractionAt: (effort: number) => number;
  /** Whether any of it is uphill. Flat routes skip the arithmetic. */
  hilly: boolean;
}

const FLAT: Pace = { fractionAt: (effort) => effort, hilly: false };

/**
 * The run, leg by leg, with the hills costing more time than their length.
 *
 * Measured on the straight lines between junctions rather than the drawn
 * path — the same approximation the pigeon milestones already make. A leg
 * that curves around a building is a little longer than the line between its
 * ends, and at this scale nobody has ever noticed.
 */
export function paceOf(level: Level, route: Route): Pace {
  const points = routePoints(level, route);
  if (points.length < 2) return FLAT;

  const legs: { length: number; cost: number }[] = [];
  let hilly = false;

  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const length = Math.hypot(dx, dy);
    const hill = roadById(level, route.roadIds[i - 1]).hill === true;
    if (hill) hilly = true;
    legs.push({ length, cost: length / (hill ? HILL_SPEED : 1) });
  }

  const totalLength = legs.reduce((sum, leg) => sum + leg.length, 0);
  const totalCost = legs.reduce((sum, leg) => sum + leg.cost, 0);
  if (!hilly || totalLength === 0 || totalCost === 0) return FLAT;

  return {
    hilly,
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
