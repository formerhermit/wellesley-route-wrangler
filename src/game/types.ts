export type MapNodeType =
  | "junction"
  | "observatory"
  | "bush"
  | "canal"
  | "park"
  | "pigeon"
  | "hill"
  | "depot"
  | "pond"
  | "cow"
  | "carpark";

export type RoadSurface = "road" | "trail";

export interface MapNode {
  id: string;
  x: number;
  y: number;
  label: string;
  /** Short line of flavour text used in the accessible name. */
  blurb?: string;
  type?: MapNodeType;
  /** Put the label above the junction, where below would collide. */
  labelAbove?: boolean;
}

export interface Road {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  closed?: boolean;
  hill?: boolean;
  /** Defaults to "road". Levels may require staying off one or the other. */
  surface?: RoadSurface;
  /** 0–1. Purely decorative: drives where pigeons are drawn and animated. */
  pigeonRisk?: number;
}

/** Copy for one outcome. `{km}` is replaced with the route's distance. */
export interface ResultCopy {
  title: string;
  message: string;
}

/**
 * Objectives are declared per level and evaluated by `routeEvaluation`. Each
 * carries its own failure copy so the humour stays with the level content and
 * out of the rules.
 */
export type LevelObjective =
  | { kind: "start"; detail: string }
  | { kind: "finish"; detail: string }
  | {
      kind: "distance";
      minKm: number;
      maxKm: number;
      tooLong: ResultCopy;
      tooShort: ResultCopy;
    }
  | {
      kind: "visit";
      nodeIds: string[];
      what: string;
      done: string;
      pending: string;
      missed: ResultCopy;
      /** Used when the route simply stops at one of these nodes. */
      stranded?: ResultCopy;
    }
  | { kind: "avoid-closed"; fail: ResultCopy }
  | {
      kind: "avoid-surface";
      surface: RoadSurface;
      what: string;
      fail: ResultCopy;
    }
  | {
      kind: "max-node-type";
      nodeType: MapNodeType;
      limit: number;
      what: string;
      fail: ResultCopy;
    }
  | { kind: "no-repeat"; fail: ResultCopy };

export type ObjectiveKind = LevelObjective["kind"];

export interface Level {
  id: string;
  title: string;
  strapline: string;
  instructions: string;
  /** Drives the incidental scenery: terraced houses versus open country. */
  theme: "town" | "trail";
  nodes: MapNode[];
  roads: Road[];
  startNodeId: string;
  finishNodeId: string;
  /** Checklist order. Failure priority is fixed in `resultSelection`. */
  objectives: LevelObjective[];
  success: ResultCopy;
  emptyRoute: ResultCopy;
  fallback: ResultCopy;
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
  kind: ObjectiveKind;
  label: string;
  detail: string;
  state: ObjectiveState;
  /** Present when the objective has failed: the copy for the result panel. */
  fail?: ResultCopy;
}

/** A headline figure for the result panel, derived from the objectives. */
export interface EvaluationStat {
  label: string;
  value: string;
}

export interface RouteEvaluation {
  totalDistanceKm: number;
  isEmpty: boolean;
  endsAtFinish: boolean;
  objectives: ObjectiveResult[];
  stats: EvaluationStat[];
  /** Set when the route has stopped somewhere it was only meant to pass. */
  stranded?: ResultCopy;
  success: boolean;
}

export interface GameResult {
  title: string;
  message: string;
  success: boolean;
}
