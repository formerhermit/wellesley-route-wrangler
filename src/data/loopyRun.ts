import type { Level } from "../game/types";

/**
 * The Thursday map from the Observatory down, lifted to make room for what is
 * underneath it. The middle of that map — the pond, the canal, the town — is
 * simply not on this one, so the roads heading north are somebody else's
 * problem, exactly as the roads heading south were on the Town Run.
 *
 * The signature is the road round the Sports Centre: two roads joining the
 * same two junctions, one either side of the building. Everything about how
 * that is chosen, undone and drawn lives in `routeGraph`.
 */
export const loopyRun: Level = {
  id: "loopy-run",
  title: "Loopy",
  strapline: "Round and round we go.",
  instructions:
    "South from the Observatory, out past the airport, and round the back of the Sports Centre. The pool is round the far side of the building, so getting to it means going round — there is no other way in.",
  theme: "town",

  objectives: [
    { kind: "start", detail: "Everyone gathers by the telescope, as ever." },
    { kind: "finish", detail: "Route closes the loop." },
    {
      kind: "distance",
      minKm: 7,
      maxKm: 8.5,
      tooLong: {
        title: "Loopier Than Intended",
        message:
          "{km} km. Somebody has been round the sports centre twice and is claiming it was deliberate. The club is not convinced.",
      },
      tooShort: {
        title: "Half A Loop Is Not A Loop",
        message:
          "{km} km. The group went out, had a look at the airport, and came home. The pool has not been seen by anybody.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["pool-loop"],
      what: "the Pool Loop",
      reportLabel: "Pool loop done",
      done: "Round the back of the sports centre, past the pool, out again.",
      pending: "Not been round the back yet.",
      missed: {
        title: "You Never Went Round The Back",
        message:
          "The whole point of this one is the loop round the sports centre and you ran straight past it. There is a pool back there. Nobody saw it.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "The Towpath Goes Nowhere",
        message:
          "You took the group up to the canal and then straight through the fence at the far end of it. The towpath is shut. It has been shut for years. There is a sign.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["shoe-lane"],
      what: "Shoe Lane",
      reportLabel: "Shoe Lane reached",
      done: "Down Shoe Lane, which is neither a lane nor about shoes.",
      pending: "Shoe Lane is still down there somewhere.",
      missed: {
        title: "Shoe Lane Remains Unvisited",
        message:
          "A run that never got as far as Shoe Lane. The far corner of the map is starting to feel left out, and frankly so is the airport.",
      },
    },
  ],

  nodes: [
    // Kept from the Thursday map, lifted 230 to make room below.
    {
      id: "observatory",
      labelAbove: true,
      x: 130,
      y: 70,
      label: "The Observatory",
      blurb: "start and finish",
      type: "observatory",
      // Its telescope juts right, and the road down to the Polo Fields runs
      // past that shoulder.
      spriteDx: -52,
      spriteDy: 42,
    },
    {
      id: "polo-fields",
      // Below, not beside: this is the left-hand edge and the name runs off it.
      labelDy: 6,
      x: 110,
      y: 230,
      label: "The Polo Fields",
      blurb: "bins, benches, parkrun on Saturdays",
      type: "park",
    },
    {
      id: "back-passage",
      // Above, and lifted. Both sides are hopeless here: the lane in from the
      // Polo Fields and the lane on to The Hanger both leave this junction
      // almost horizontally, so a name on either side is bisected by one of
      // them. The lift is to clear the lane down from the Observatory, which
      // passes just under the first line.
      labelAbove: true,
      labelDy: -18,
      x: 285,
      y: 240,
      label: "Up The Back Passage",
      blurb: "a cut-through, and yes, everybody says it",
    },
    {
      id: "the-hanger",
      labelSide: "right",
      x: 455,
      y: 250,
      label: "The Hanger",
      blurb: "pigeon hotspot; they nest in the roof",
      type: "pigeon",
      sprite: "hangar",
      // Left of the junction: the path up to the towpath leaves northwards,
      // straight through the hangar door.
      spriteDx: -55,
      spriteDy: -46,
    },
    {
      id: "private-bush",
      // Beside it rather than above it: above put the writing across the lane
      // climbing to the towpath, and this side sits it next to its own bush.
      labelSide: "right",
      x: 645,
      y: 215,
      label: "A Private Bush",
      blurb: "nobody saw anything",
      type: "bush",
      spriteDx: 45,
      spriteDy: 30,
    },

    {
      id: "grubby-towpath",
      labelAbove: true,
      x: 480,
      y: 110,
      label: "Grubby Towpath",
      blurb: "the canal, and the only way on is shut",
      type: "canal",
    },

    // New, below.
    {
      id: "hecking-airport",
      labelSide: "right",
      x: 550,
      y: 360,
      label: "Hecking Airport",
      blurb: "one runway, one aeroplane, no departures",
      type: "airport",
    },
    {
      id: "shoe-lane",
      // Beside the junction: nothing leaves it to the right, so the name has
      // that side to itself.
      labelSide: "right",
      x: 560,
      y: 495,
      label: "Shoe Lane",
      blurb: "neither a lane nor about shoes",
    },
    {
      id: "sports-centre",
      labelSide: "right",
      x: 120,
      y: 385,
      label: "The Sports Centre",
      blurb: "the road goes round it, so you may as well too",
      type: "sportscentre",
      // The building belongs inside its own loop, not at one end of it, so it
      // sits at the midpoint between this junction and the Pool Loop.
      spriteDx: -30,
      spriteDy: 48,
    },
    {
      id: "pool-loop",
      x: 60,
      y: 480,
      labelSide: "right",
      label: "Pool Loop",
      blurb: "round the back, where the pool is",
      type: "pool",
      // The pool is inside the building. What the loop actually goes past is
      // the bins.
      sprite: "bin",
      spriteDx: -6,
      spriteDy: 38,
    },
    {
      id: "hockey-loop",
      x: 305,
      y: 470,
      label: "Hockey Loop",
      blurb: "astroturf, floodlights, permanently booked",
    },
  ],

  roads: [
    // Kept from the Thursday map. The Back Passage closure is lifted.
    { id: "obs-polo", from: "observatory", to: "polo-fields", distanceKm: 0.7 },
    {
      id: "polo-passage",
      from: "polo-fields",
      to: "back-passage",
      distanceKm: 0.7,
    },
    {
      id: "hanger-bush",
      from: "the-hanger",
      to: "private-bush",
      distanceKm: 0.8,
      pigeonRisk: 0.6,
    },

    // Up to the canal from the Hanger, and the only path onward from it shut.
    // Worth the detour to nobody, which is rather the point.
    {
      id: "hanger-towpath",
      from: "the-hanger",
      to: "grubby-towpath",
      distanceKm: 0.6,
    },
    {
      id: "towpath-bush",
      from: "grubby-towpath",
      to: "private-bush",
      distanceKm: 0.8,
      closed: true,
    },

    // The middle of the Thursday map is not on this one, so these put the two
    // halves back in touch.
    {
      id: "obs-passage",
      from: "observatory",
      to: "back-passage",
      distanceKm: 1,
    },
    {
      id: "passage-hanger",
      from: "back-passage",
      to: "the-hanger",
      distanceKm: 0.7,
      pigeonRisk: 0.5,
    },

    // The airport, under the bush and the hangar, and Shoe Lane below it.
    {
      id: "bush-airport",
      from: "private-bush",
      to: "hecking-airport",
      distanceKm: 0.7,
    },
    {
      id: "hanger-airport",
      from: "the-hanger",
      to: "hecking-airport",
      distanceKm: 0.6,
      pigeonRisk: 0.7,
    },
    {
      id: "airport-shoe",
      from: "hecking-airport",
      to: "shoe-lane",
      distanceKm: 0.6,
    },

    // Polo Fields down to the Sports Centre, across to the Hockey Loop, back
    // to the Back Passage, and the Back Passage to the Polo Fields again.
    {
      id: "polo-sports",
      from: "polo-fields",
      to: "sports-centre",
      distanceKm: 0.6,
    },
    {
      id: "sports-hockey",
      from: "sports-centre",
      to: "hockey-loop",
      distanceKm: 0.8,
    },
    {
      id: "hockey-passage",
      from: "hockey-loop",
      to: "back-passage",
      distanceKm: 1,
    },

    // Closes the bottom of the map. Without these, Shoe Lane hangs off the
    // airport as a dead end and could never be visited at all.
    { id: "shoe-hockey", from: "shoe-lane", to: "hockey-loop", distanceKm: 1.1 },
    {
      id: "hockey-airport",
      from: "hockey-loop",
      to: "hecking-airport",
      distanceKm: 1.1,
    },

    // The road round the Sports Centre, with its one stop at the back. Two
    // roads, same two junctions: out one side of the building and back the
    // other.
    {
      id: "pool-out",
      from: "sports-centre",
      to: "pool-loop",
      distanceKm: 0.5,
    },
    {
      id: "pool-back",
      from: "sports-centre",
      to: "pool-loop",
      distanceKm: 0.5,
    },
  ],

  startNodeId: "observatory",
  finishNodeId: "observatory",

  success: {
    title: "Loop Complete",
    message:
      "{km} km, all the way round the sports centre and down to Shoe Lane. Somebody counted the laps and somebody else disputes the count, but the run itself was faultless.",
  },
  emptyRoute: {
    title: "Nobody Left the Observatory",
    message:
      "A run named Loopy, and not one loop has been run. The telescope has seen more action than the group.",
  },
  fallback: {
    title: "Round And Round We Went",
    message:
      "{km} km of loops, none of them the right loops. The committee has drawn a diagram and it has not helped.",
  },

  // On past the towpath, then north off the top of the map, keeping well to
  // the right of the Observatory and its label.
  canalTail: [
    { x: 370, y: 95 },
    { x: 300, y: 80 },
    { x: 262, y: 40 },
    { x: 250, y: -30 },
  ],

  // Town again, so town things: bins out, a cat on a wall, lights nobody
  // waits at.
  scatter: [
    { x: 400, y: 160, kind: "lights" },
    { x: 660, y: 120, kind: "cat" },
    { x: 240, y: 300, kind: "bin" },
    // In the middle of the Shoe Lane, Hockey Loop and airport triangle, which
    // is the biggest piece of blank paper on the map.
    { x: 472, y: 442, kind: "cat" },
    { x: 380, y: 300, kind: "car", variant: 2 },
    { x: 700, y: 300, kind: "car", variant: 1 },
    { x: 200, y: 320, kind: "bin" },
    // Pulled off the lane between the Observatory and the Back Passage.
    { x: 174, y: 185, kind: "car", variant: 3 },

    // Trees round Shoe Lane. Scattered rather than made a park: it is a lane
    // with trees on it, and a green patch would claim otherwise.
    { x: 600, y: 545, kind: "tree" },
    { x: 670, y: 515, kind: "tree" },
    { x: 655, y: 450, kind: "tree" },
  ],

  /*
   * The built-up bits (#101). The airport apron, which is the largest area of
   * tarmac on the roster, and the sports centre with the car park it shares
   * with the pool round the back.
   */
  ground: [
    { x: 452, y: 292, width: 216, height: 168 },
    { x: 42, y: 316, width: 208, height: 148 },
    { x: 168, y: 486, width: 456, height: 66 },
  ],

  view: { width: 800, height: 560 },
};
