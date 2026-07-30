export type MapNodeType =
  | "junction"
  | "observatory"
  | "bush"
  | "canal"
  | "park"
  | "pigeon"
  | "hill"
  | "depot";

export interface MapNode {
  id: string;
  x: number;
  y: number;
  label: string;
  /** Short line of flavour text used in the accessible name. */
  blurb?: string;
  type?: MapNodeType;
}

export interface Road {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  closed?: boolean;
  hill?: boolean;
  /** 0–1. Purely decorative: drives where pigeons are drawn and animated. */
  pigeonRisk?: number;
}

export interface Level {
  id: string;
  title: string;
  strapline: string;
  instructions: string;
  nodes: MapNode[];
  roads: Road[];
  startNodeId: string;
  finishNodeId: string;
  /** The route must visit at least one of these (the canal). */
  checkpointNodeIds: string[];
  checkpointLabel: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  maxPigeonHotspots: number;
  /** viewBox of the map SVG. */
  view: { width: number; height: number };
}

/**
 * A route is a walk through the graph: the junctions visited in order, plus the
 * roads taken between them. `roadIds.length` is always `nodeIds.length - 1`.
 */
export interface Route {
  nodeIds: string[];
  roadIds: string[];
}

export type ObjectiveState = "incomplete" | "passed" | "failed";

export interface ObjectiveResult {
  id: string;
  label: string;
  detail: string;
  state: ObjectiveState;
}

export interface RouteEvaluation {
  totalDistanceKm: number;
  visitedCheckpoint: boolean;
  pigeonHotspotCount: number;
  usedClosedRoad: boolean;
  hasRepeatedRoad: boolean;
  endsAtFinish: boolean;
  endsAtCheckpoint: boolean;
  isEmpty: boolean;
  objectives: ObjectiveResult[];
  success: boolean;
}

export interface GameResult {
  title: string;
  message: string;
  success: boolean;
}
