import type { Level } from "../game/types";

/**
 * Frensham, and the third map on the roster with open water on it — which is
 * the thing it had to not be. Fleet Pond is a wheel round the water and Hawley
 * is a lap of it, so a third pond map drawn the same way would be the least
 * distinctive level here.
 *
 * So the water is where this one starts rather than what it is about. The
 * Great Pond is lapped in the first kilometre and then left behind: the run is
 * the crossing of Frensham Common on Sandy Lane, out to the Little Pond, and
 * back by way of the Devil's Jumps. The pond is the car park you meet at, and
 * the common is the puzzle.
 *
 * All of it is real. The Great Pond has a National Trust car park at its west
 * end and a genuine sand beach along its north shore — families, windbreaks
 * and an ice cream queue, in Surrey. The Sailing Club is on Pond Lane and the
 * Pond Hotel on Bacon Lane, two minutes from a car park full of muddy runners.
 * The King's Ridge is 90 m and Stony Jump, the nearest of the three Devil's
 * Jumps at Churt, is 120 m. The Flashes are on Churt Common and Jumps Stream
 * runs down past the Little Pond, as it says.
 *
 * The closure is real too and is the one thing here that is a rule rather than
 * a joke: Frensham Common is heath, the heath has ground-nesting birds on it,
 * and the National Trust ropes paths off through the season for exactly that
 * reason.
 *
 * Daylight and the house theme, like every level that is not a seasonal one.
 * `flock: "duck"` is the only field of that kind set, and it is set because
 * the Great Pond has waterfowl on it rather than for the look — the same call
 * Hawley Lake makes, and the same mechanism.
 */
export const frenshamPonds: Level = {
  id: "frensham-ponds",
  title: "Frensham Great Pond",
  strapline: "There is a beach. In Surrey.",
  instructions:
    "Round the Great Pond, then out across the common on Sandy Lane to the Little Pond and back over the Devil's Jumps. Half of Surrey is on the beach and none of them are moving.",
  theme: "trail",
  flock: "duck",
  startNodeId: "great-pond-car-park",
  finishNodeId: "great-pond-car-park",
  view: { width: 800, height: 560 },

  /*
   * Canada geese, of which the Great Pond has an unreasonable number. Waiting
   * on the beach, and if the group runs along it one of them comes too.
   */
  followers: [{ kind: "goose", nodeId: "the-beach", dx: -34, dy: 44, scale: 0.9 }],

  objectives: [
    { kind: "start", detail: "Everyone meets by the ticket machine, as ever." },
    { kind: "finish", detail: "Route closes the loop." },
    {
      kind: "distance",
      minKm: 9,
      maxKm: 10.5,
      tooLong: {
        title: "That Was Not A Ten",
        message:
          "{km} km. Somebody has been round the Jumps twice and is describing it as a warm-up. Two people are queueing at the ice cream van and will not be moved.",
      },
      tooShort: {
        title: "A Nice Walk Round A Pond",
        message:
          "{km} km. You drove all the way to Frensham, went round the water, and came home. The common is right there. It is the whole reason.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["little-pond"],
      what: "the Little Pond",
      reportLabel: "Little Pond reached",
      done: "Across the common and round the quiet one.",
      pending: "Not been near the Little Pond yet.",
      missed: {
        title: "One Pond Short",
        message:
          "There are two ponds at Frensham and the group has visited one of them. The Little Pond is the nicer of the two and everybody knows it.",
      },
      stranded: {
        title: "Nobody Left The Little Pond",
        message:
          "They got to the quiet pond, sat down on the bank, and that was the end of the run. Somebody has produced a flask.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["stony-jump"],
      what: "the Devil's Jumps",
      reportLabel: "Jumps climbed",
      done: "Up Stony Jump. A hundred and twenty metres of it.",
      pending: "The Jumps are still out there to the east.",
      missed: {
        title: "The Devil Was Not Troubled",
        message:
          "A run advertised as taking in the Devil's Jumps that got nowhere near them. They are the only hill worth the drive and you have gone round the outside.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "It Was Roped Off For The Nesting",
        message:
          "The heath is roped off in the season because things nest on the ground out here. You have run nine people straight down the middle of it.",
      },
    },
  ],

  success: {
    title: "A Proper Day Out",
    message:
      "{km} km, both ponds, the Jumps climbed and only the one lot of ducks. Everybody is back and somebody is already in the water.",
  },
  emptyRoute: {
    title: "Nobody Left The Car Park",
    message:
      "The group stood by the ticket machine working out whose card had contactless until the parking was academic.",
  },
  fallback: {
    title: "A Long Way To Come For That",
    message:
      "{km} km of Surrey. The committee has read the account twice and would like to hear it from somebody else.",
  },

  nodes: [
    /*
     * The bank. Four of these draw the water they enclose, so the order here is
     * the order round the pond and not a list.
     */
    {
      id: "great-pond-car-park",
      x: 135,
      y: 290,
      label: "Great Pond Car Park",
      blurb: "start and finish, and it is not free",
      type: "shore",
      sprite: "carpark",
      // Beside, not above: the sign hangs fifty units over the junction and a
      // two-line name hangs above that, so one of them had to move.
      labelSide: "left",
    },
    {
      id: "the-beach",
      x: 225,
      y: 205,
      label: "The Beach",
      blurb: "sand, windbreaks, and half of Surrey",
      type: "shore",
      sprite: "sand",
      labelAbove: true,
    },
    {
      id: "farnham-road",
      x: 320,
      y: 305,
      label: "Farnham Road",
      blurb: "the A287, and it is not slowing down for you",
      type: "shore",
      labelSide: "right",
    },
    {
      id: "sailing-club",
      x: 185,
      y: 400,
      label: "The Sailing Club",
      blurb: "dinghies, and a members' car park you may not use",
      type: "shore",
      sprite: "sailing",
      // Further out onto the water, which is where a dinghy belongs anyway:
      // the default thirty puts it on the bank road round to the car park.
      spriteDy: -55,
    },

    // Everything else, which is the run.
    {
      id: "pond-hotel",
      x: 75,
      y: 455,
      label: "The Pond Hotel",
      blurb: "spa, afternoon tea, and nine people covered in sand",
      type: "manor",
      // Left of where the type puts it, off the lane climbing to the car park.
      // The name goes below, which is the one quarter no road leaves through.
      spriteDx: -30,
    },
    {
      id: "sandy-lane",
      x: 395,
      y: 165,
      label: "Sandy Lane",
      blurb: "the way across the common, and accurately named",
      labelAbove: true,
    },
    {
      id: "little-pond",
      x: 555,
      y: 85,
      label: "Little Pond",
      blurb: "the quiet one, and the better one",
      type: "pond",
    },
    {
      id: "jumps-stream",
      x: 640,
      y: 215,
      label: "Jumps Stream",
      blurb: "duck hotspot, and wet feet either way",
      type: "pigeon",
      // Left, not right: right runs the name into the tree the trail theme
      // plants at 740, 200.
      labelSide: "left",
    },
    {
      id: "the-flashes",
      x: 560,
      y: 370,
      label: "The Flashes",
      blurb: "standing water most of the year, and all of this one",
      type: "mud",
      // Beside: the water is drawn below the junction and the name was sitting
      // in it, and above is where the track down from Jumps Stream arrives.
      labelSide: "left",
    },
    {
      id: "stony-jump",
      x: 705,
      y: 455,
      label: "Stony Jump",
      blurb: "120 m, and the first of the three",
      type: "hill",
      // Above, for the same reason: the theme's tree at 700, 505 sits exactly
      // where this name would otherwise go.
      labelAbove: true,
      // And the marker down and left, out of the lane in from Churt.
      spriteDx: -60,
      spriteDy: 35,
    },
    {
      id: "kings-ridge",
      x: 400,
      y: 420,
      label: "The King's Ridge",
      blurb: "90 m, and the whole common from the top",
      type: "hill",
    },
    {
      id: "churt",
      x: 315,
      y: 515,
      label: "Churt",
      blurb: "a village, a crossroads, and a pub you are not stopping at",
      type: "pub",
      labelSide: "right",
      // Up and left of where the type puts it. The default sixty clears the
      // King's Ridge label by twenty-two units on paper and not at all by eye:
      // a pub is a wide building drawn around its anchor, and the test that
      // checks this measures a point. Roads box this junction in on three
      // sides, so it was the building that had to move rather than the name.
      spriteDx: -35,
      spriteDy: -80,
    },
  ],

  // Frensham on a good day: dinghies out, the van doing business, and the
  // heath doing what heath does everywhere else on the map.
  scatter: [
    { x: 200, y: 285, kind: "boat" },
    { x: 245, y: 330, kind: "boat", flip: true },
    { x: 300, y: 150, kind: "icecream" },
    { x: 150, y: 155, kind: "youths" },

    { x: 60, y: 100, kind: "gorse", variant: 1 },
    { x: 470, y: 260, kind: "gorse" },
    { x: 470, y: 470, kind: "gorse", variant: 1 },
    { x: 480, y: 90, kind: "alpine" },
    { x: 700, y: 120, kind: "wellingtonia" },
    { x: 640, y: 340, kind: "rock" },
    { x: 760, y: 300, kind: "tree" },

    { x: 100, y: 200, kind: "bench" },
    { x: 430, y: 520, kind: "bench" },
    { x: 430, y: 300, kind: "signpost" },
    { x: 200, y: 490, kind: "dog" },
    { x: 620, y: 500, kind: "flowers" },
    { x: 380, y: 60, kind: "butterfly" },
    // The nesting signs, which is what the roped-off path is about.
    { x: 545, y: 265, kind: "warning" },
  ],

  roads: [
    // The lap of the Great Pond, which is the first kilometre and then done.
    {
      id: "carpark-beach",
      from: "great-pond-car-park",
      to: "the-beach",
      distanceKm: 0.5,
      surface: "trail",
    },
    {
      id: "beach-farnham",
      from: "the-beach",
      to: "farnham-road",
      distanceKm: 0.6,
      surface: "trail",
    },
    { id: "farnham-sailing", from: "farnham-road", to: "sailing-club", distanceKm: 0.8 },
    {
      id: "sailing-carpark",
      from: "sailing-club",
      to: "great-pond-car-park",
      distanceKm: 0.6,
      surface: "trail",
    },

    // Pond Lane and Bacon Lane, round the back of the hotel.
    { id: "sailing-hotel", from: "sailing-club", to: "pond-hotel", distanceKm: 0.5 },
    {
      id: "hotel-carpark",
      from: "pond-hotel",
      to: "great-pond-car-park",
      distanceKm: 0.7,
    },

    // Sandy Lane and the tracks across Frensham Common.
    {
      id: "beach-sandy",
      from: "the-beach",
      to: "sandy-lane",
      distanceKm: 1,
      surface: "trail",
    },
    {
      id: "sandy-little",
      from: "sandy-lane",
      to: "little-pond",
      distanceKm: 1.2,
      surface: "trail",
    },
    {
      id: "sandy-farnham",
      from: "sandy-lane",
      to: "farnham-road",
      distanceKm: 0.8,
      surface: "trail",
    },
    {
      id: "sandy-ridge",
      from: "sandy-lane",
      to: "kings-ridge",
      distanceKm: 0.9,
      surface: "trail",
      hill: true,
    },
    {
      id: "farnham-ridge",
      from: "farnham-road",
      to: "kings-ridge",
      distanceKm: 0.9,
      surface: "trail",
      hill: true,
    },

    // East, to the stream and the Flashes.
    {
      id: "little-stream",
      from: "little-pond",
      to: "jumps-stream",
      distanceKm: 0.9,
      surface: "trail",
      pigeonRisk: 0.5,
    },
    {
      id: "stream-flashes",
      from: "jumps-stream",
      to: "the-flashes",
      distanceKm: 1,
      surface: "trail",
      pigeonRisk: 0.6,
    },

    /*
     * King's Ridge to the Flashes, across the common. It costs 456 wrong loops
     * and enables no extra winner, which is normally the profile of a road to
     * cut — but without it the east is a single chain from the Little Pond to
     * Stony Jump, and the two waypoints can then only be satisfied together.
     * Two objectives that can never disagree are one objective with two ticks.
     */
    {
      id: "ridge-flashes",
      from: "kings-ridge",
      to: "the-flashes",
      distanceKm: 1.1,
      surface: "trail",
      pigeonRisk: 0.4,
    },

    // And up the Jumps, three ways, all of them uphill.
    {
      id: "flashes-jump",
      from: "the-flashes",
      to: "stony-jump",
      distanceKm: 0.9,
      surface: "trail",
      hill: true,
    },
    { id: "churt-jump", from: "churt", to: "stony-jump", distanceKm: 1.4, hill: true },

    // Churt, and the lane home along the bottom.
    { id: "ridge-churt", from: "kings-ridge", to: "churt", distanceKm: 1.2 },
    { id: "churt-sailing", from: "churt", to: "sailing-club", distanceKm: 1.3 },

    /*
     * Roped off for the nesting, which on this ground is a real restriction
     * rather than a joke: Frensham Common is heath, and heath is where things
     * nest on the floor.
     */
    {
      id: "ridge-jump",
      from: "kings-ridge",
      to: "stony-jump",
      distanceKm: 1.5,
      surface: "trail",
      hill: true,
      closed: true,
    },
  ],
};
