export type MapNodeType =
  | "junction"
  | "observatory"
  | "bush"
  | "canal"
  | "park"
  | "pigeon"
  | "hill"
  | "shop"
  | "pond"
  | "cow"
  | "carpark"
  | "hangar"
  | "statue"
  | "towncentre"
  | "cemetery"
  /** Junctions on a pond's bank. Three or more of them draw the water. */
  | "shore"
  | "coffee"
  | "railway"
  | "football"
  | "golf"
  | "woods"
  | "sportscentre"
  | "pool"
  | "airport";

export type RoadSurface = "road" | "trail";

export interface MapNode {
  id: string;
  x: number;
  y: number;
  label: string;
  /** Short line of flavour text used in the accessible name. */
  blurb?: string;
  type?: MapNodeType;
  /**
   * Draw a different landmark from the one `type` implies — the Hangar counts
   * as a pigeon hotspot but should not look like Pigeon Square.
   */
  sprite?: MapNodeType;
  /** Put the label above the junction, where below would collide. */
  labelAbove?: boolean;
  /** Or beside it, where there is no room above or below. */
  labelSide?: "left" | "right";
  /** Shift the label off wherever its placement put it. Down is positive. */
  labelDy?: number;
  /**
   * Where the landmark sits, when this junction wants it somewhere other than
   * where its type puts every other one. Replaces the type's offset rather
   * than adding to it, so the number reads as a position, not a correction.
   */
  spriteDx?: number;
  spriteDy?: number;
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
      /** Overrides the incident report's line, e.g. "Cows greeted". */
      reportLabel?: string;
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
      /** Overrides the generated label, which reads poorly at a limit of 0. */
      label?: string;
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
  /**
   * Where the canal goes after its last junction. Water does not stop in a
   * field, so a level whose canal should leave the map says where it heads.
   * Without this it tapers off past the last towpath, as the Thursday map's
   * does.
   */
  canalTail?: { x: number; y: number }[];
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
