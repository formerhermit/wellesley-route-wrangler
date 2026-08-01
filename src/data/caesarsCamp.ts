import type { Level } from "../game/types";

/**
 * Caesar's Camp: heath, sand and an Iron Age hillfort, and the proof that the
 * rules are level-agnostic — the first level judged on staying off the tarmac
 * rather than on pigeon hotspots.
 */
export const caesarsCamp: Level = {
  // Not renamed with the level: progress is a list of these, so changing it
  // would take a completed run off everybody who has already done it.
  id: "sunday-trail-run",
  title: "Caesar's Camp",
  strapline: "There's coffee at the end.",
  instructions:
    "A proper loop from the car park, out on the trails and back before the parking ticket expires. This one is not flat and nobody pretended it was.",
  theme: "trail",
  startNodeId: "car-park",
  finishNodeId: "car-park",
  view: { width: 800, height: 560 },

  // The top of this map is heath nobody runs across, and it was reading as
  // blank paper. Sand, scrub and boulders, kept clear of the labels and the
  // climb up to the trig point.
  scatter: [
    { x: 170, y: 140, kind: "tree" },
    { x: 255, y: 120, kind: "rock" },
    { x: 340, y: 90, kind: "tree" },
    { x: 400, y: 45, kind: "rock" },
    { x: 450, y: 78, kind: "tree" },
    { x: 520, y: 45, kind: "rock" },
    { x: 565, y: 95, kind: "tree" },
    { x: 655, y: 115, kind: "rock" },
    { x: 720, y: 60, kind: "tree" },

    // The soldiers themselves, dug in around their hill and each in one of
    // the gaps between the paths off it. Small, because they are hiding, and
    // facing four different ways, because nobody told them which way.
    { x: 205, y: 228, kind: "soldier", variant: 2 },
    { x: 232, y: 208, kind: "soldier", variant: 1, flip: true },
    { x: 350, y: 240, kind: "soldier", variant: 0, flip: true },
    { x: 318, y: 275, kind: "soldier", variant: 3 },

    // Dogs, off the lead and delighted, and somewhere to sit and watch.
    { x: 340, y: 460, kind: "dog" },
    { x: 400, y: 420, kind: "dog", flip: true },
    { x: 580, y: 380, kind: "bench" },
    { x: 140, y: 400, kind: "bench" },
  ],

  objectives: [
    { kind: "start", detail: "Trail shoes on, ticket bought, optimism high." },
    { kind: "finish", detail: "Everyone accounted for, before the ticket runs out." },
    {
      kind: "distance",
      minKm: 10,
      maxKm: 11.5,
      tooLong: {
        title: "Accidental Long Run",
        message:
          "{km} km of Sunday. Two people have bonked, one is eating a gel found in a coat pocket, and the pub stopped serving food an hour ago.",
      },
      tooShort: {
        title: "An Innovative Definition of 10K",
        message:
          "{km} km. Everyone is suspiciously clean and nobody is willing to call that a trail run.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["cow-field"],
      what: "the cows",
      reportLabel: "Cows greeted",
      done: "Hellos exchanged. The cows were unmoved.",
      pending: "The cows have not been greeted.",
      missed: {
        title: "The Cows Were Not Greeted",
        message:
          "You ran past a field of cows without saying hello. The club has standards, and that was not one of them being met.",
      },
      stranded: {
        title: "Nobody Left the Cows",
        message:
          "The group is still in the field. Someone is attempting to pet one. This was always going to happen.",
      },
    },
    {
      kind: "avoid-surface",
      surface: "road",
      what: "the tarmac",
      fail: {
        title: "That Was Just a Road Run",
        message:
          "You put a trail group on the lanes. They came back clean, cross, and muttering about how they could have worn the nice shoes.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "It Was Closed For Lambing",
        message:
          "The sign said lambing. The farmer said several other things. The group has learned some new words.",
      },
    },
    {
      kind: "max-node-type",
      nodeType: "pigeon",
      limit: 0,
      what: "pigeon barn",
      label: "Give the pigeon barn a wide berth",
      fail: {
        title: "Pigeon-Controlled Route",
        message:
          "You took them past the barn. Forty pigeons came out at chest height. It is being described, already, as an ambush.",
      },
    },
  ],

  success: {
    title: "Textbook Trail Run",
    message:
      "{km} km, not a scrap of tarmac, cows greeted, pigeons avoided. Everyone is filthy and delighted. This is the one they will talk about.",
  },
  emptyRoute: {
    title: "Barely Left the Start Line",
    message:
      "The group stood in the car park comparing shoes until the ticket expired.",
  },
  fallback: {
    title: "Everyone Returned Eventually",
    message:
      "Something went sideways out on the hill, but they are all back, caked to the knee, and nobody is explaining.",
  },

  nodes: [
    {
      id: "suspicious-car",
      x: 90,
      y: 470,
      label: "Suspicious Car",
      blurb: "nobody knows whose it is",
      labelAbove: true,
      type: "car",
    },
    {
      id: "stile",
      x: 245,
      y: 505,
      label: "The Awkward Stile",
      blurb: "everyone queues, nobody knows why",
      labelAbove: true,
    },
    {
      id: "cow-field",
      x: 425,
      y: 480,
      label: "Cow Field",
      blurb: "say hello",
      type: "cow",
    },
    {
      id: "cattlegrid",
      x: 610,
      y: 470,
      label: "Scary Cattlegrid",
      blurb: "everyone slows down, nobody admits why",
      labelAbove: true,
    },
    {
      id: "car-park",
      x: 720,
      y: 335,
      label: "Overpriced Car Park",
      blurb: "start and finish, £4.50 for two hours",
      type: "carpark",
      // Beside the junction, not above it: the lane up to the pond leaves
      // northwards and went straight through the sign.
      spriteDx: 42,
      spriteDy: -14,
    },
    {
      id: "woods",
      x: 455,
      y: 330,
      label: "Wellesley Woods",
      blurb: "roots, mainly",
      type: "park",
    },
    {
      id: "soldiers",
      x: 285,
      y: 225,
      label: "Eeek Soldiers",
      blurb: "allegedly on manoeuvres",
      type: "hill",
      labelAbove: true,
    },
    {
      id: "trig",
      x: 505,
      y: 155,
      label: "Trig Point",
      blurb: "obligatory photograph",
      type: "hill",
      labelAbove: true,
      // Further out than a hill usually sits: the climb up from the soldiers
      // arrives across the spot the marker was standing in.
      spriteDx: -70,
      spriteDy: -18,
    },
    {
      id: "stinky-pond",
      x: 690,
      y: 195,
      label: "The Stinky Pond",
      blurb: "you can smell it from up here",
      type: "pond",
      labelAbove: true,
    },
    {
      id: "pigeon-barn",
      x: 610,
      y: 285,
      label: "Pigeon Barn",
      blurb: "pigeon hotspot",
      type: "pigeon",
    },
    {
      id: "portaloos",
      x: 145,
      y: 315,
      label: "Random Portaloos",
      blurb: "unexpectedly welcome",
      labelAbove: true,
      type: "portaloo",
    },
    {
      id: "gate",
      x: 255,
      y: 390,
      label: "The Gate That Bites",
      blurb: "mind the spring",
    },
  ],

  roads: [
    // The trails. Between them these form a loop out from the car park and
    // back, in either direction.
    { id: "park-cattlegrid", from: "car-park", to: "cattlegrid", distanceKm: 1.1, surface: "trail" },
    { id: "cattlegrid-cows", from: "cattlegrid", to: "cow-field", distanceKm: 1.2, surface: "trail" },
    { id: "cows-stile", from: "cow-field", to: "stile", distanceKm: 1, surface: "trail" },
    { id: "stile-car", from: "stile", to: "suspicious-car", distanceKm: 0.9, surface: "trail" },
    { id: "car-gate", from: "suspicious-car", to: "gate", distanceKm: 0.8, surface: "trail" },
    { id: "gate-portaloos", from: "gate", to: "portaloos", distanceKm: 0.9, surface: "trail" },
    { id: "portaloos-soldiers", from: "portaloos", to: "soldiers", distanceKm: 1.1, surface: "trail", hill: true },
    { id: "soldiers-woods", from: "soldiers", to: "woods", distanceKm: 1.2, surface: "trail", hill: true },
    { id: "woods-trig", from: "woods", to: "trig", distanceKm: 1, surface: "trail", hill: true },
    { id: "trig-pond", from: "trig", to: "stinky-pond", distanceKm: 1.1, surface: "trail" },
    { id: "pond-park", from: "stinky-pond", to: "car-park", distanceKm: 0.9, surface: "trail" },

    // Cross-country links, for a shorter or a different way round.
    { id: "cows-woods", from: "cow-field", to: "woods", distanceKm: 1.1, surface: "trail" },
    { id: "soldiers-trig", from: "soldiers", to: "trig", distanceKm: 1.5, surface: "trail", hill: true },
    {
      id: "gate-soldiers",
      from: "gate",
      to: "soldiers",
      distanceKm: 1.1,
      surface: "trail",
      closed: true,
    },

    // Past the barn. Shorter, and a terrible idea.
    {
      id: "trig-barn",
      from: "trig",
      to: "pigeon-barn",
      distanceKm: 0.9,
      surface: "trail",
      pigeonRisk: 0.8,
    },
    {
      id: "barn-park",
      from: "pigeon-barn",
      to: "car-park",
      distanceKm: 1,
      surface: "trail",
      pigeonRisk: 0.6,
    },

    // The tarmac. Shorter, flatter, and entirely against the point.
    { id: "stile-woods", from: "stile", to: "woods", distanceKm: 1.5 },
    { id: "woods-park", from: "woods", to: "car-park", distanceKm: 1.6 },
    { id: "cattlegrid-pond", from: "cattlegrid", to: "stinky-pond", distanceKm: 1.3 },
  ],
};
