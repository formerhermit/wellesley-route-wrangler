import type { Level } from "../game/types";

/**
 * A wheel: the track round the water, the places beyond it, and the paths
 * joining the two. Nothing is a dead end, which is the whole point — every
 * corner of the pond can be reached more than one way, and that is exactly how
 * a group of adults ends up somewhere they did not intend to be.
 */
export const fleetPondRun: Level = {
  id: "fleet-pond-run",
  title: "Fleet Pond",
  strapline: "How did we get lost?",
  instructions:
    "Out of the station car park and round the water. Somewhere out there is a coffee van, and the club would like a word with it. The station approach is the only tarmac on the map, so you will be going the long way about.",
  theme: "trail",

  objectives: [
    { kind: "start", detail: "Trainers on, permit displayed, hope high." },
    { kind: "finish", detail: "Route closes the loop." },
    {
      kind: "distance",
      minKm: 8,
      maxKm: 9.5,
      tooLong: {
        title: "A Full Tour of Hampshire",
        message:
          "{km} km. You have been round the pond, past the pond, and back to the pond. Two people are asking, quite reasonably, which pond.",
      },
      tooShort: {
        title: "That Was Basically A Walk",
        message:
          "{km} km. The group got round the near side of the water and declared it a session. The coffee van has not even seen you.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["coffee-van"],
      what: "the Surprise Coffee Van",
      reportLabel: "Coffee van found",
      done: "Found it. Nobody has any money, but found it.",
      pending: "The coffee van is out there somewhere.",
      missed: {
        title: "No Van, No Coffee, No Point",
        message:
          "A run round Fleet Pond that did not find the coffee van. There is a photograph of it on the club WhatsApp from this very morning and you went nowhere near.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["the-woods"],
      what: "the woods",
      reportLabel: "Woods entered",
      done: "In among the pines, briefly unsure which way was out.",
      pending: "Not been in the trees yet.",
      missed: {
        title: "You Stayed On The Nice Bit",
        message:
          "All the way out here and not one stretch of proper woodland. The club came for roots and mud and got a lakeside stroll.",
      },
    },
    {
      kind: "avoid-surface",
      surface: "road",
      what: "the tarmac",
      fail: {
        title: "Station Approach Is Not A Trail",
        message:
          "You put a trail run down the station approach. Somebody's fresh shoes are now spotless, and they are furious about it.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "The Boardwalk Is Shut",
        message:
          "The south bank has been fenced off since the last time it rained properly. You sent everyone along it anyway and the group is now single file on a plank.",
      },
    },
  ],

  nodes: [
    // The bank. Three or more of these draw the water they enclose, so the
    // order here is the order round the pond, not an arbitrary list.
    {
      id: "north-shore",
      labelAbove: true,
      x: 400,
      y: 170,
      label: "North Bank",
      blurb: "reeds, moorhens, one shopping trolley",
      type: "shore",
    },
    {
      id: "east-shore",
      labelSide: "right",
      x: 560,
      y: 255,
      label: "The Jetty",
      blurb: "nobody knows who built it",
      type: "shore",
    },
    {
      id: "south-shore",
      x: 455,
      y: 415,
      label: "The Boardwalk",
      blurb: "springy underfoot, allegedly on purpose",
      type: "shore",
    },
    {
      id: "west-shore",
      x: 285,
      y: 405,
      label: "Sandy Bay",
      blurb: "not sand, and not a bay",
      type: "shore",
    },
    {
      id: "reed-corner",
      labelSide: "left",
      x: 245,
      y: 215,
      label: "Cow Corner",
      blurb: "cows, and where the path becomes a suggestion",
      // Still a bank junction, whatever the cows think: the pond is drawn
      // from the ring these five make, and this is one of the five.
      type: "shore",
    },

    // Everywhere the track leads off to.
    {
      id: "car-park",
      // Below, not beside: this is the right-hand edge of the map and the name
      // is too long to fit out there. Nudged clear of the path to the pitches.
      labelDy: 8,
      x: 705,
      y: 395,
      label: "Station Car Park",
      blurb: "start and finish, £4.80 all day",
      type: "carpark",
      // Beside the junction, not above it: the road up to the line runs
      // through where the sign used to stand.
      spriteDx: 52,
      spriteDy: -40,
    },
    {
      id: "train-line",
      labelSide: "left",
      x: 700,
      y: 160,
      label: "The Train Line",
      blurb: "the 07:42 has strong opinions about your pace",
      type: "railway",
    },
    {
      id: "coffee-van",
      labelAbove: true,
      x: 415,
      y: 62,
      label: "Surprise Coffee Van",
      blurb: "never twice in the same lay-by",
      type: "coffee",
      // The name takes two lines and this is the top of the map, so the van
      // parks off to one side of it rather than under it.
      spriteDx: 85,
      spriteDy: -30,
    },
    {
      id: "the-woods",
      labelSide: "right",
      x: 110,
      y: 120,
      label: "The Woods",
      blurb: "roots, mud, and a genuine sense of peril",
      type: "woods",
      // Up and to the right, off the tree the trail theme plants at 90,90.
      // The default put a sixty-wide wood squarely on top of it, seventeen
      // units deep, and nothing noticed until the scenery test learned how
      // big things are drawn (#110).
      spriteDx: 22,
      spriteDy: -26,
    },
    {
      id: "golf-club",
      labelSide: "right",
      x: 95,
      y: 380,
      label: "The Golf Club",
      blurb: "they have asked us not to run through the ninth",
      type: "golf",
    },
    {
      id: "football",
      x: 330,
      y: 520,
      label: "Football Pitches",
      blurb: "under water from October to April",
      type: "football",
    },
  ],

  roads: [
    // Round the water.
    {
      id: "north-east-shore",
      from: "north-shore",
      to: "east-shore",
      distanceKm: 0.8,
      surface: "trail",
    },
    {
      id: "east-south-shore",
      from: "east-shore",
      to: "south-shore",
      distanceKm: 0.8,
      surface: "trail",
    },
    {
      id: "south-west-shore",
      from: "south-shore",
      to: "west-shore",
      distanceKm: 0.7,
      surface: "trail",
      closed: true,
    },
    {
      id: "west-reed",
      from: "west-shore",
      to: "reed-corner",
      distanceKm: 0.8,
      surface: "trail",
    },
    {
      id: "reed-north",
      from: "reed-corner",
      to: "north-shore",
      distanceKm: 0.7,
      surface: "trail",
    },

    // Round the outside.
    {
      id: "woods-coffee",
      from: "the-woods",
      to: "coffee-van",
      distanceKm: 1.3,
      surface: "trail",
    },
    {
      id: "coffee-train",
      from: "coffee-van",
      to: "train-line",
      distanceKm: 1.3,
      surface: "trail",
    },
    // The one bit of tarmac on the map.
    { id: "train-carpark", from: "train-line", to: "car-park", distanceKm: 1 },
    {
      id: "carpark-football",
      from: "car-park",
      to: "football",
      distanceKm: 1.6,
      surface: "trail",
    },
    {
      id: "football-golf",
      from: "football",
      to: "golf-club",
      distanceKm: 1.1,
      surface: "trail",
    },
    {
      id: "golf-woods",
      from: "golf-club",
      to: "the-woods",
      distanceKm: 1.1,
      surface: "trail",
    },

    // In and out from the bank.
    {
      id: "coffee-spoke",
      from: "coffee-van",
      to: "north-shore",
      distanceKm: 0.5,
      surface: "trail",
    },
    {
      id: "train-spoke",
      from: "train-line",
      to: "east-shore",
      distanceKm: 0.7,
      surface: "trail",
    },
    {
      id: "carpark-spoke",
      from: "car-park",
      to: "south-shore",
      distanceKm: 1,
      surface: "trail",
    },
    {
      id: "football-spoke",
      from: "football",
      to: "west-shore",
      distanceKm: 0.5,
      surface: "trail",
    },
    {
      id: "golf-spoke",
      from: "golf-club",
      to: "reed-corner",
      distanceKm: 0.9,
      surface: "trail",
    },
    {
      id: "woods-spoke",
      from: "the-woods",
      to: "reed-corner",
      distanceKm: 0.7,
      surface: "trail",
    },
  ],

  startNodeId: "car-park",
  finishNodeId: "car-park",

  success: {
    title: "Round The Pond, Eventually",
    message:
      "{km} km, the woods done properly, the van found, and not a step on the tarmac. Nobody is entirely sure of the route they took, which is traditional.",
  },
  emptyRoute: {
    title: "Still In The Car Park",
    message:
      "Everyone is here. Everyone is changed. Everyone is looking at the pond. Nobody has moved.",
  },
  fallback: {
    title: "How Did We Get Lost",
    message:
      "{km} km of what can only be described as wandering. The committee would like a map, drawn from memory, by Friday.",
  },

  // The herd Cow Corner is named after, on the dry side of the bank and off
  // the lanes either side of it. Nothing on this level requires visiting them;
  // they are here to be said hello to.
  scatter: [
    { x: 178, y: 248, kind: "cow" },
    { x: 138, y: 272, kind: "cow", flip: true },
    { x: 208, y: 292, kind: "cow" },

    // Dogs, and two benches for watching the water do nothing.
    { x: 200, y: 340, kind: "dog" },
    { x: 620, y: 460, kind: "dog", flip: true },
    { x: 620, y: 300, kind: "bench" },
    { x: 200, y: 480, kind: "bench" },
  ],

  // The goose waits by the Jetty. Run past it and it falls in at the back.
  followers: [{ kind: "goose", nodeId: "east-shore", dx: 34, dy: 36 }],

  view: { width: 800, height: 560 },
};
