import type { Level } from "../game/types";

/**
 * The Thursday map in December. Same twelve junctions, same roads, and two
 * things swapped over: the Back Passage is open, because there is mulled wine
 * on it, and the towpath is shut everywhere the lights do not reach. Level 1
 * gives you the canal two ways; this one gives it to you over the bridge or
 * not at all.
 *
 * Everything festive about it is declared here — the light (`mood`), the birds
 * (`flock`), the hats (`kit`), the music, and three lots of carol singers who
 * will join in given the slightest encouragement. The rules in `src/game/`
 * know none of it.
 */
export const christmasRun: Level = {
  id: "christmas-run",
  title: "Christmas Run",
  strapline: "Hats are optional. They are not optional.",
  instructions:
    "The Thursday loop in December: over the Canal Bridge and past the town tree, with the towpath shut wherever it is unlit. The mulled wine is not compulsory. It is, however, on the way.",
  theme: "town",
  mood: "frost",
  flock: "robin",
  kit: "santa",
  music: "christmas-theme.mp3",

  startNodeId: "observatory",
  finishNodeId: "observatory",
  /*
   * The built-up bits (#101), which are level 1's, because this is that map in
   * December: the retail park, the terrace along the bottom, and the Medical
   * Centre. Under frost they go pale blue with everything else.
   */
  ground: [
    { x: 528, y: 16, width: 252, height: 178 },
    { x: 162, y: 488, width: 462, height: 64 },
    { x: 252, y: 100, width: 152, height: 128 },
  ],

  view: { width: 800, height: 560 },

  // As level 1: on past the towpath and clean off the western edge.
  canalTail: [
    { x: 360, y: 250 },
    { x: 250, y: 232 },
    { x: 120, y: 228 },
    { x: -30, y: 210 },
  ],

  objectives: [
    { kind: "start", detail: "Everyone gathers by the telescope, in tinsel." },
    { kind: "finish", detail: "Route closes the loop." },
    {
      kind: "distance",
      // Wide enough at the bottom that the quick way round the bridge and the
      // tree comes up short: without that, the shortest legal route is also
      // the shortest possible one, and "too short" is copy nobody can reach.
      minKm: 7.5,
      maxKm: 11,
      tooLong: {
        title: "The Long Way Round In December",
        message:
          "{km} km, in the dark, in hats. Two people have peeled off for the pub and are not answering.",
      },
      tooShort: {
        title: "Straight To The Mulled Wine",
        message:
          "{km} km. A distance chosen by people who had somewhere warm to be, which is everybody.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["canal-bridge"],
      what: "the Canal Bridge",
      reportLabel: "Bridge crossed",
      done: "Over the bridge, and nobody looked down.",
      pending: "Not been anywhere near the water yet.",
      missed: {
        title: "The Canal Went Unseen",
        message:
          "The towpath is shut and you skipped the bridge as well. A Thursday with no canal in it at all.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["christmas-tree"],
      what: "the Town Christmas Tree",
      reportLabel: "Tree admired",
      done: "Tree admired. It is leaning again.",
      pending: "The tree has not been passed yet.",
      missed: {
        title: "Nobody Saw The Tree",
        message:
          "The council put it up, straightened it twice, and lit it. You took the group round the back of it.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "Down The Unlit Towpath",
        message:
          "The lit stretch runs to the Medical Centre and no further. Somebody is in the canal and is being very calm about it.",
      },
    },
    {
      kind: "max-node-type",
      nodeType: "pigeon",
      limit: 1,
      what: "robin hotspot",
      fail: {
        title: "Robin-Controlled Route",
        message:
          "Two hotspots. The robins are territorial, they are festive, and they have taken the flapjacks.",
      },
    },
  ],

  success: {
    title: "A Properly Festive Thursday",
    message:
      "{km} km, over the bridge, past the tree, one lot of robins. Everybody is wearing a hat and nobody is admitting whose idea it was.",
  },
  emptyRoute: {
    title: "Nobody Left The Observatory",
    message:
      "The group stood by the telescope in matching hats, agreed it was cold, and went to the pub.",
  },
  fallback: {
    title: "Everyone Returned, Eventually, Singing",
    message:
      "{km} km, and the group is back, frozen and cheerful, with more people than it set off with.",
  },

  nodes: [
    {
      id: "observatory",
      labelAbove: true,
      x: 130,
      y: 300,
      label: "The Observatory",
      blurb: "start and finish",
      type: "observatory",
    },
    {
      id: "wellesley-rumble",
      // The name dropped towards its junction and the house lifted away from
      // it: the two had ended up within three units of each other.
      labelAbove: true,
      labelDy: 10,
      spriteDy: -66,
      x: 150,
      y: 175,
      label: "Wellesley Humble",
      blurb: "does the whole street's lights on its own",
      type: "cottage",
    },
    {
      id: "the-hanger",
      x: 455,
      y: 480,
      label: "The Hanger",
      blurb: "robin hotspot; they nest in the roof",
      type: "pigeon",
      sprite: "hangar",
    },
    {
      id: "christmas-tree",
      // Not above: the tree stands to the right of its junction and is tall
      // enough to reach a name written over it.
      x: 645,
      y: 445,
      label: "The Town Christmas Tree",
      blurb: "the council straightened it twice",
      type: "christmastree",
    },
    {
      id: "canal-bridge",
      x: 700,
      y: 300,
      label: "Canal Bridge",
      blurb: "the only way to the canal this month",
      type: "canal",
    },
    {
      id: "towpath",
      x: 470,
      y: 285,
      label: "Grubby Towpath",
      blurb: "lit as far as the Medical Centre and no further",
      type: "canal",
    },
    {
      id: "geese-pond",
      labelAbove: true,
      x: 300,
      y: 330,
      label: "Frozen Geese Pond",
      blurb: "they remember faces, and it is frozen",
      type: "pond",
    },
    {
      id: "polo-fields",
      x: 110,
      y: 460,
      label: "The Polo Fields",
      blurb: "carol singers, and no way past them",
      type: "park",
    },
    {
      id: "medical-centre",
      labelAbove: true,
      x: 320,
      y: 165,
      label: "Medical Centre Toilet",
      blurb: "a quick pitstop, no questions asked",
      type: "toilet",
    },
    {
      id: "mulled-wine",
      // The barrier is off this road this year, so the writing can go back
      // beside the junction on the side the stall is not.
      labelSide: "right",
      x: 285,
      y: 470,
      label: "The Mulled Wine Stop",
      blurb: "billed to the club as a hydration station",
      type: "mulledwine",
      // Left of the junction: the lane up to the pond runs through where a
      // stall would otherwise stand.
      spriteDx: -52,
      spriteDy: -44,
    },
    {
      id: "hospital-hill",
      x: 495,
      y: 130,
      label: "Hospital Hill",
      blurb: "robin hotspot, and a hill about it",
      type: "pigeon",
      sprite: "hill",
      // Up and left of the junction, as on the Thursday map: the lane in from
      // the Medical Centre arrives across where a hill marker usually sits.
      spriteDx: -65,
      spriteDy: -30,
    },
    {
      id: "big-tesco",
      x: 690,
      y: 155,
      label: "The Big Tesco",
      blurb: "the car park is a roundabout with tinsel on",
      type: "shop",
    },
  ],

  roads: [
    { id: "obs-rumble", from: "observatory", to: "wellesley-rumble", distanceKm: 0.5 },
    {
      id: "rumble-medical",
      from: "wellesley-rumble",
      to: "medical-centre",
      distanceKm: 0.7,
    },
    { id: "rumble-pond", from: "wellesley-rumble", to: "geese-pond", distanceKm: 0.9 },
    {
      id: "hanger-tree",
      from: "the-hanger",
      to: "christmas-tree",
      distanceKm: 0.8,
      pigeonRisk: 0.6,
    },
    {
      id: "hanger-pond",
      from: "the-hanger",
      to: "geese-pond",
      distanceKm: 0.9,
      pigeonRisk: 0.5,
    },
    { id: "tree-canal", from: "christmas-tree", to: "canal-bridge", distanceKm: 0.6 },
    { id: "tree-tesco", from: "christmas-tree", to: "big-tesco", distanceKm: 1.2 },
    { id: "tesco-canal", from: "big-tesco", to: "canal-bridge", distanceKm: 0.6 },
    { id: "medical-polo", from: "medical-centre", to: "polo-fields", distanceKm: 1.5 },
    {
      id: "medical-hospital",
      from: "medical-centre",
      to: "hospital-hill",
      distanceKm: 0.7,
      hill: true,
      pigeonRisk: 0.7,
    },
    {
      id: "hospital-tesco",
      from: "hospital-hill",
      to: "big-tesco",
      distanceKm: 0.8,
      hill: true,
      pigeonRisk: 0.6,
    },
    { id: "polo-obs", from: "polo-fields", to: "observatory", distanceKm: 0.7 },
    { id: "pond-polo", from: "geese-pond", to: "polo-fields", distanceKm: 1 },

    // Open this year, and the whole reason anybody agreed to come.
    { id: "mulled-pond", from: "mulled-wine", to: "geese-pond", distanceKm: 0.6 },
    { id: "mulled-polo", from: "mulled-wine", to: "polo-fields", distanceKm: 0.7 },

    // The lit stretch of the towpath: the bridge, the water, and out again at
    // the Medical Centre. This much you may run.
    { id: "canal-tow", from: "canal-bridge", to: "towpath", distanceKm: 1 },
    { id: "tow-medical", from: "towpath", to: "medical-centre", distanceKm: 0.8 },

    // And the three ends of it that nobody has lit, all shut.
    {
      id: "tree-tow",
      from: "christmas-tree",
      to: "towpath",
      distanceKm: 1,
      closed: true,
    },
    { id: "pond-tow", from: "geese-pond", to: "towpath", distanceKm: 0.7, closed: true },
    {
      id: "hospital-tow",
      from: "hospital-hill",
      to: "towpath",
      distanceKm: 0.7,
      closed: true,
      pigeonRisk: 0.4,
    },
  ],

  // The goose, on the ice, exactly as unbothered as it was in level 1 — and
  // three lots of carol singers, who need no encouragement whatsoever. Pick up
  // all three and the group comes home with more people than it left with.
  followers: [
    { kind: "goose", nodeId: "geese-pond", dx: -60, dy: 15, scale: 1.3 },
    { kind: "carollers", nodeId: "medical-centre", dx: -70, dy: 40 },
    { kind: "carollers", nodeId: "polo-fields", dx: 60, dy: -30 },
    { kind: "carollers", nodeId: "big-tesco", dx: 70, dy: 64 },
  ],

  // The town, dressed. Snowmen and a tree in every gap the roads leave, holly
  // and candy canes in the smaller ones, and presents nobody has come back for.
  scatter: [
    { x: 70, y: 90, kind: "snowman" },
    { x: 620, y: 530, kind: "snowman" },

    { x: 230, y: 75, kind: "xmastree" },
    // Below the Canal Bridge rather than above it: the carol singers outside
    // the Tesco are already standing where this used to be.
    { x: 766, y: 306, kind: "xmastree" },
    { x: 200, y: 255, kind: "xmastree" },

    { x: 60, y: 545, kind: "present" },
    { x: 762, y: 400, kind: "present" },
    { x: 250, y: 120, kind: "present" },
    { x: 770, y: 90, kind: "present" },

    { x: 400, y: 60, kind: "candycane" },
    { x: 560, y: 200, kind: "candycane" },
    { x: 390, y: 375, kind: "candycane" },

    { x: 55, y: 395, kind: "holly" },
    { x: 560, y: 425, kind: "holly" },
    { x: 700, y: 545, kind: "holly" },

    // The one piece of street furniture that is not festive at all: the lights
    // below Hospital Hill, which the group waits at every week regardless.
    { x: 560, y: 110, kind: "lights" },
  ],
};
