import type { Level } from "../game/types";

/**
 * The sixth level, and the hardest. A trail loop from the Barley Mow around
 * the river, judged on staying off the lanes — the same rule as the Sunday
 * run, on a map that fights it much harder: the village end is all tarmac,
 * and the two places you must reach sit on opposite ends of the water.
 *
 * The river is drawn by the canal mechanism, from the two junctions standing
 * in it. Water through junctions is water through junctions.
 */
export const tilfordRun: Level = {
  id: "tilford-run",
  title: "Tilford",
  strapline: "Round the river, back to the pub.",
  instructions:
    "Out from the Barley Mow, over the bridge and along to the goose, then back for last orders. The lanes are quicker and the lanes are cheating.",
  theme: "trail",
  startNodeId: "barley-mow",
  finishNodeId: "barley-mow",
  view: { width: 800, height: 560 },

  objectives: [
    { kind: "start", detail: "Everyone meets outside the pub, an hour early." },
    { kind: "finish", detail: "Back at the Barley Mow, as promised." },
    {
      kind: "distance",
      minKm: 7.5,
      maxKm: 8,
      tooLong: {
        title: "The Kitchen Has Closed",
        message:
          "{km} km. You were told the kitchen shuts at two. It is ten past, and there are crisps.",
      },
      tooShort: {
        title: "Straight To The Bar",
        message:
          "{km} km and everybody is already sitting down. The club does not count this as a run.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["river-bridge"],
      what: "the river bridge",
      reportLabel: "River crossed",
      done: "Over the bridge, single file, one photograph.",
      pending: "The river has not been crossed.",
      missed: {
        title: "Same Side All Along",
        message:
          "A run round the river that never went over it. The bridge has been there since 1600 and is starting to take this personally.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["paddling-spot"],
      what: "the paddling spot",
      reportLabel: "Goose greeted",
      done: "The goose has been greeted. It is coming with you now.",
      pending: "The goose is still waiting.",
      missed: {
        title: "The Goose Was Not Consulted",
        message:
          "You went round the far side and left the goose entirely out of it. It noticed. It always notices.",
      },
      stranded: {
        title: "Everyone Is In The River",
        message:
          "The group got to the paddling spot and stopped. Shoes are off. Nobody is running anywhere.",
      },
    },
    {
      kind: "avoid-surface",
      surface: "road",
      what: "the lanes",
      fail: {
        title: "That Was A Village Amble",
        message:
          "You put a trail group on the lanes past the shop. They are back early, clean, and disappointed in you.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "The Stepping Stones Are Under",
        message:
          "The river is up and the stones are somewhere beneath it. Two people are wet to the waist and one is retrieving a shoe.",
      },
    },
  ],

  success: {
    title: "Textbook Tilford",
    message:
      "{km} km, over the bridge, past the goose, not a yard of tarmac. The goose came too. The kitchen is open and the round is somebody else's.",
  },
  emptyRoute: {
    title: "Nobody Got Up",
    message:
      "The group is outside the Barley Mow, discussing the route. They have been discussing it for forty minutes.",
  },
  fallback: {
    title: "Back At The Barley Mow",
    message:
      "{km} km of something. Nobody is calling it the route that was planned, but everybody is here.",
  },

  nodes: [
    {
      id: "village-shop",
      x: 110,
      y: 150,
      label: "The Village Shop",
      blurb: "shuts when it feels like it",
      type: "shop",
      labelAbove: true,
      // Higher than a shop usually sits: the label goes in underneath it.
      spriteDy: -62,
    },
    {
      id: "barley-mow",
      x: 300,
      y: 165,
      label: "The Barley Mow",
      blurb: "start and finish, and the whole point",
      type: "pub",
      labelAbove: true,
    },
    {
      id: "cricket-green",
      x: 505,
      y: 125,
      label: "The Cricket Green",
      blurb: "mind the square",
      type: "cricket",
      labelAbove: true,
    },
    {
      id: "mosque",
      x: 715,
      y: 150,
      label: "The Mosque",
      blurb: "the quiet end of the village",
      type: "mosque",
      labelSide: "left",
    },
    {
      id: "the-institute",
      x: 140,
      y: 315,
      label: "The Institute",
      blurb: "village hall, jumble sale on Saturdays",
      labelSide: "right",
    },
    // The two junctions standing in the river, listed downstream: the water is
    // drawn in from the right edge, so the far one has to come first.
    {
      id: "paddling-spot",
      x: 610,
      y: 300,
      label: "The Paddling Spot",
      blurb: "the river, and a goose with opinions",
      type: "canal",
      labelAbove: true,
    },
    {
      id: "river-bridge",
      x: 350,
      y: 330,
      label: "The River Bridge",
      blurb: "the river, and the only dry way over it",
      type: "canal",
      sprite: "bridge",
      labelAbove: true,
    },
    {
      id: "rooty-bit",
      x: 170,
      y: 450,
      label: "The Rooty Bit",
      blurb: "somebody goes over every single week",
    },
    {
      id: "sandy-track",
      x: 390,
      y: 500,
      label: "The Sandy Bit",
      blurb: "energy-sapping and universally hated",
      labelAbove: true,
    },
    {
      id: "posh-cows",
      x: 620,
      y: 490,
      label: "The Posh Cows",
      blurb: "belted, groomed, and worth a detour",
      type: "cow",
      // Left, not right: to the right is the hill, and its marker was standing
      // where the cow wanted to be.
      spriteDx: -60,
      spriteDy: -32,
    },
    {
      id: "hankley-hill",
      x: 740,
      y: 420,
      label: "Hankley Hill",
      blurb: "sand, heather, and no shade whatsoever",
      type: "hill",
      labelAbove: true,
    },
  ],

  roads: [
    // The trails. The river bank, the common, and the way back over the green.
    { id: "pub-cricket", from: "barley-mow", to: "cricket-green", distanceKm: 0.7, surface: "trail" },
    { id: "cricket-mosque", from: "cricket-green", to: "mosque", distanceKm: 1.1, surface: "trail" },
    { id: "cricket-paddling", from: "cricket-green", to: "paddling-spot", distanceKm: 1, surface: "trail" },
    { id: "mosque-paddling", from: "mosque", to: "paddling-spot", distanceKm: 1.3, surface: "trail" },
    { id: "mosque-hankley", from: "mosque", to: "hankley-hill", distanceKm: 1.5, surface: "trail", hill: true },
    { id: "hankley-paddling", from: "hankley-hill", to: "paddling-spot", distanceKm: 1.1, surface: "trail", hill: true },
    { id: "hankley-cows", from: "hankley-hill", to: "posh-cows", distanceKm: 0.9, surface: "trail" },
    { id: "cows-sandy", from: "posh-cows", to: "sandy-track", distanceKm: 1, surface: "trail" },
    { id: "sandy-bridge", from: "sandy-track", to: "river-bridge", distanceKm: 1.3, surface: "trail" },
    { id: "sandy-rooty", from: "sandy-track", to: "rooty-bit", distanceKm: 1.2, surface: "trail" },
    { id: "rooty-bridge", from: "rooty-bit", to: "river-bridge", distanceKm: 1.2, surface: "trail" },
    { id: "rooty-institute", from: "rooty-bit", to: "the-institute", distanceKm: 1, surface: "trail" },
    { id: "bridge-institute", from: "river-bridge", to: "the-institute", distanceKm: 1.1, surface: "trail" },
    { id: "institute-pub", from: "the-institute", to: "barley-mow", distanceKm: 0.9, surface: "trail" },
    { id: "bridge-paddling", from: "river-bridge", to: "paddling-spot", distanceKm: 1.5, surface: "trail" },

    // The stepping stones. The short way across, and under water since March.
    {
      id: "paddling-cows",
      from: "paddling-spot",
      to: "posh-cows",
      distanceKm: 0.9,
      surface: "trail",
      closed: true,
    },

    // The lanes. Quicker, flatter, and the reason this level is hard: the
    // shop can only be reached on tarmac, so it can never be reached at all.
    { id: "pub-shop", from: "barley-mow", to: "village-shop", distanceKm: 0.5 },
    { id: "shop-institute", from: "village-shop", to: "the-institute", distanceKm: 0.6 },
    { id: "shop-cricket", from: "village-shop", to: "cricket-green", distanceKm: 1.2 },
    { id: "pub-bridge", from: "barley-mow", to: "river-bridge", distanceKm: 0.9 },
    { id: "institute-sandy", from: "the-institute", to: "sandy-track", distanceKm: 1.5 },
  ],

  // The same goose as Fleet Pond's, waiting at the water's edge. Run the
  // group past it and it comes with them.
  follower: { kind: "goose", nodeId: "paddling-spot", dx: 50, dy: 44 },

  // The middle of this map is common between the river and the sandy tracks,
  // and it was reading as empty paper.
  scatter: [
    { x: 235, y: 375, kind: "tree" },
    { x: 300, y: 430, kind: "tree" },
    { x: 480, y: 420, kind: "tree" },
    { x: 545, y: 380, kind: "tree" },
  ],

  // The Wey, on down the valley and off the map to the west.
  canalTail: [
    { x: 210, y: 360 },
    { x: 90, y: 405 },
    { x: -30, y: 470 },
  ],
};
