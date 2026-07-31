import type { Level } from "../game/types";

/**
 * The second level, and the proof that the rules are level-agnostic: a
 * point-to-point rather than a loop, judged on staying off tarmac rather than
 * on pigeon hotspots.
 */
export const sundayTrailRun: Level = {
  id: "sunday-trail-run",
  title: "Sunday Trail Run",
  strapline: "Bring gaiters. No, proper ones.",
  instructions:
    "Get the group from the Village Hall out to the Muddy Car Park, the long way round. Stay on the trails, say hello to the cows, and keep off the tarmac — this is supposed to be a trail run.",
  theme: "trail",
  startNodeId: "village-hall",
  finishNodeId: "car-park",
  view: { width: 800, height: 560 },

  objectives: [
    { kind: "start", detail: "Boots on, optimism high." },
    { kind: "finish", detail: "Everyone accounted for by the boot of the car." },
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
    {
      kind: "no-repeat",
      fail: {
        title: "Everyone Returned Eventually",
        message:
          "You doubled back through the same gate so many times it has started to feel personal.",
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
      "The group stood in the Village Hall car park comparing gaiters until it got dark.",
  },
  fallback: {
    title: "Everyone Returned Eventually",
    message:
      "Something went sideways out on the hill, but they are all back, caked to the knee, and nobody is explaining.",
  },

  nodes: [
    {
      id: "village-hall",
      x: 90,
      y: 470,
      label: "The Village Hall",
      blurb: "start, and the only working tap",
      labelAbove: true,
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
      id: "ford",
      x: 610,
      y: 470,
      label: "The Ford (Optimistic)",
      blurb: "wet feet from here on",
      labelAbove: true,
    },
    {
      id: "car-park",
      x: 720,
      y: 335,
      label: "Muddy Car Park",
      blurb: "finish",
      type: "carpark",
    },
    {
      id: "woods",
      x: 455,
      y: 330,
      label: "Whispering Woods",
      blurb: "roots, mainly",
      type: "park",
    },
    {
      id: "ridge",
      x: 285,
      y: 225,
      label: "Windy Ridge",
      blurb: "the view is allegedly worth it",
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
    },
    {
      id: "reservoir",
      x: 690,
      y: 195,
      label: "The Reservoir",
      blurb: "colder than it looks",
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
      id: "bogs",
      x: 145,
      y: 315,
      label: "The Bogs of Regret",
      blurb: "shoe-claiming",
      labelAbove: true,
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
    // The trails.
    { id: "hall-stile", from: "village-hall", to: "stile", distanceKm: 1.2, surface: "trail" },
    { id: "stile-cows", from: "stile", to: "cow-field", distanceKm: 1.3, surface: "trail" },
    { id: "cows-ford", from: "cow-field", to: "ford", distanceKm: 1.5, surface: "trail" },
    { id: "ford-park", from: "ford", to: "car-park", distanceKm: 1.3, surface: "trail" },
    { id: "cows-woods", from: "cow-field", to: "woods", distanceKm: 1.3, surface: "trail" },
    { id: "woods-ridge", from: "woods", to: "ridge", distanceKm: 1.4, surface: "trail", hill: true },
    { id: "ridge-bogs", from: "ridge", to: "bogs", distanceKm: 1.2, surface: "trail", hill: true },
    { id: "bogs-gate", from: "bogs", to: "gate", distanceKm: 1, surface: "trail" },
    { id: "gate-stile", from: "gate", to: "stile", distanceKm: 1.1, surface: "trail" },
    { id: "woods-trig", from: "woods", to: "trig", distanceKm: 1.1, surface: "trail", hill: true },
    { id: "ridge-trig", from: "ridge", to: "trig", distanceKm: 1.5, surface: "trail", hill: true },
    { id: "trig-reservoir", from: "trig", to: "reservoir", distanceKm: 1.2, surface: "trail" },
    { id: "reservoir-park", from: "reservoir", to: "car-park", distanceKm: 1.1, surface: "trail" },
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
    {
      id: "gate-ridge",
      from: "gate",
      to: "ridge",
      distanceKm: 1.1,
      surface: "trail",
      closed: true,
    },

    // The tarmac. Shorter, flatter, and entirely against the point.
    { id: "hall-gate", from: "village-hall", to: "gate", distanceKm: 0.9 },
    { id: "stile-ford", from: "stile", to: "ford", distanceKm: 2 },
    { id: "ford-reservoir", from: "ford", to: "reservoir", distanceKm: 1.3 },
    { id: "woods-park", from: "woods", to: "car-park", distanceKm: 1.6 },
  ],
};
