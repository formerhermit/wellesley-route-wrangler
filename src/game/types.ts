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
  /** The junction is the pool; what you run past out the back is the bin. */
  | "pool"
  | "bin"
  | "airport"
  | "pub"
  | "cricket"
  | "mosque"
  /** Drawn on the water rather than beside it: it stands in the river. */
  | "bridge"
  | "church"
  | "ghost"
  | "portaloo"
  /** A real one, with a door and a cistern. The portaloos are their own type. */
  | "toilet"
  | "car"
  | "manor"
  | "sailing"
  | "sand"
  | "mud"
  /** A street of trick or treaters. A group of adults gets no further. */
  | "treaters"
  /** A house with rather more lights on it than the neighbours would like. */
  | "cottage"
  /** The town tree, wonky, and the council's own fault. */
  | "christmastree"
  /** A trestle table, an urn, and the real reason anybody turned up. */
  | "mulledwine"
  /** The Atlantic Wall on Hankley Common. Concrete, shelled, and still there. */
  | "wall"
  /** A camera on sticks. Bourne Wood is a working film location (#113). */
  | "filmset"
  /** And the trucks it arrives in. */
  | "filmunit"
  /** A Bronze Age round barrow: twenty-odd metres across and a metre high. */
  | "barrow"
  /** Mother Ludlam's, in the sandstone, with the spring still coming out. */
  | "cave"
  /** The Canadian searchlight post, up there since the war. */
  | "searchlight";

export type RoadSurface = "road" | "trail";

/**
 * Something true of a road that a brief can ask you to keep off, marked per
 * road rather than worked out from anything else.
 *
 * Both are deliberately loose of `surface`. Nearly every road on a trail map
 * is a trail, so "avoid the trails" there forbids the whole map — and the lane
 * along the bottom of a valley can be filthy in February while the sandy track
 * over the heath stays dry. Mud is where the map says it is.
 */
export type RoadTrait = "hill" | "muddy";

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
   * Break a short name onto two lines anyway. For a junction whose label is
   * wide enough to reach a road but not long enough to wrap on its own.
   */
  labelWrap?: boolean;
  /**
   * Where the landmark sits, when this junction wants it somewhere other than
   * where its type puts every other one. Replaces the type's offset rather
   * than adding to it, so the number reads as a position, not a correction.
   */
  spriteDx?: number;
  spriteDy?: number;
  /**
   * Draw this landmark over the roads instead of under them. For the one that
   * has nowhere to stand that a road does not already cross.
   */
  spriteOnTop?: boolean;
  /**
   * Keep the green and drop the three trees a `park` junction scatters round
   * itself. For a green with something on it already — Cove Green has a race
   * going past and a crowd watching it, and the trees were standing in front
   * of both. Nothing else reads a park's trees, so this only changes the
   * drawing.
   */
  noTrees?: boolean;
}

export interface Road {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  closed?: boolean;
  hill?: boolean;
  /**
   * Filthy underfoot, whatever it is paved with. Nothing in the base game
   * reads this — it is here for the briefing (#10), where somebody's new
   * shoes and a flooded February have opinions about it.
   */
  muddy?: boolean;
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
  /**
   * Keep off every road marked with a trait. The counterpart to `climb`,
   * which asks for hills — this one refuses them, or refuses the mud.
   */
  | {
      kind: "avoid-roads";
      trait: RoadTrait;
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
  /**
   * Take at least this many roads marked `hill`. The one objective that asks
   * for something rather than forbidding it: everything else here is an avoid,
   * a visit or a distance, and a level whose whole point is the climbing had
   * no way to say so. Counts roads and not summits, so a flat lane to the top
   * of a hill does not satisfy it.
   */
  | { kind: "climb"; minHills: number; fail: ResultCopy }
  | { kind: "no-repeat"; fail: ResultCopy };

export type ObjectiveKind = LevelObjective["kind"];

export interface Level {
  id: string;
  title: string;
  strapline: string;
  instructions: string;
  /** Drives the incidental scenery: terraced houses versus open country. */
  theme: "town" | "trail";
  /**
   * The light the map is drawn in. Scenery and rules are unaffected — this is
   * the paper going cold, nothing more. Undefined is daylight; "dusk" is the
   * light going, and "frost" is it staying but arriving through ice.
   */
  mood?: "dusk" | "frost";
  /**
   * What the birds are. They loiter, scatter and get counted identically
   * whichever they are; only the drawing and the paperwork change.
   */
  flock?: "pigeon" | "crow" | "duck" | "robin" | "dragonfly";
  /**
   * What the group is wearing. Club vests as standard; a level may put them in
   * something seasonal, which changes the drawing and nothing else.
   */
  kit?: "santa";
  /** A file in `public/audio`. Without one the level plays the house theme. */
  music?: string;
  /**
   * How many other runners are on the road, for a level that is a race rather
   * than a club run (#111). They run the player's own route, spread up and
   * down it and off the racing line, in vests that are nobody's here.
   *
   * Setting this also puts the club's own five into one vest: in a field of
   * strangers the point of a club vest is that you can pick your own lot out,
   * and five different blues and greens cannot do that. Decorative from end to
   * end — the field is not in the way, cannot be run into, and scores nothing.
   */
  field?: number;
  /**
   * Scenery placed by hand, on top of whatever the theme scatters. For the
   * corners of a map that no road reaches and that read as blank paper
   * without it. Decorative only: nothing here is a junction.
   */
  scatter?: {
    x: number;
    y: number;
    kind:
      | "tree"
      | "rock"
      | "soldier"
      | "cow"
      | "signpost"
      | "track"
      | "startline"
      | "supporters"
      | "penguin"
      | "pumpkin"
      | "gravestone"
      | "bat"
      | "moon"
      | "cat"
      | "lights"
      | "car"
      | "bin"
      | "dog"
      | "bench"
      | "gnome"
      | "youths"
      | "flowers"
      | "butterfly"
      | "icecream"
      | "alpine"
      | "wellingtonia"
      | "gorse"
      | "unittruck"
      | "clapperboard"
      | "directorchair"
      | "boat"
      | "island"
      | "warning"
      | "snowman"
      | "candycane"
      | "present"
      | "holly"
      | "xmastree";
    /** Which drawing, where a kind has more than one. */
    variant?: number;
    /** Turn it round. Everything here is drawn facing right. */
    flip?: boolean;
  }[];
  /**
   * Things that wait by a junction and, if the group runs past them, fall in
   * at the back and follow to the finish. A route that never goes that way
   * leaves one standing where it was.
   *
   * A list because a map may have several: the Christmas Run has carol singers
   * on three corners, and picking up two is a different run from picking up
   * none. They queue up behind the group in the order the route reaches them.
   */
  followers?: {
    kind: "goose" | "treaters" | "carollers" | "dog";
    nodeId: string;
    /** Where it waits, relative to that junction. */
    dx: number;
    dy: number;
    /** Drawn bigger or smaller than usual, where the map has room. */
    scale?: number;
  }[];
  nodes: MapNode[];
  roads: Road[];
  startNodeId: string;
  finishNodeId: string;
  /** Checklist order. Failure priority is fixed in `resultSelection`. */
  objectives: LevelObjective[];
  success: ResultCopy;
  /**
   * The incident report's OVERALL line, for a level that has something of its
   * own to say about a run that worked (#117). Unset everywhere else, which
   * leaves the club's usual "Surprisingly competent." A failed run always gets
   * the committee's escalation instead: that ladder is the joke.
   */
  verdict?: string;
  emptyRoute: ResultCopy;
  fallback: ResultCopy;
  /**
   * Where the canal goes after its last junction. Water does not stop in a
   * field, so a level whose canal should leave the map says where it heads.
   * Without this it simply tapers off a little past the last towpath, which
   * no shipped level now does: water that stops in a field looks like a
   * mistake, because it is one.
   */
  canalTail?: { x: number; y: number }[];
  /**
   * Built-up ground: the grey a place is standing on (#101).
   *
   * A trail map is a field, and `map-ground--trail` tints the whole of it
   * green, which is why those maps read as somewhere. A town map had no
   * equivalent and was one flat beige with things drawn on it, so this is the
   * town's version — except that a town is not uniformly built up, so it is
   * placed rather than applied.
   *
   * Not town-only, though it started that way. A trail map is only *mostly* a
   * field: a raceway apron and a car park out on the heath are hardstanding,
   * and drawing them as grass is the same mistake in the other direction. The
   * colour differs by theme — see `ground-patch--trail` — because grey mixed
   * to sit against cream paper reads as a warm blotch against grass.
   *
   * Drawn under the roads and under everything else, like the gardens. It is
   * ground, so a road crossing it is the point rather than a clash, and
   * nothing here is a junction or affects a single rule.
   */
  ground?: { x: number; y: number; width: number; height: number; rx?: number }[];
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
