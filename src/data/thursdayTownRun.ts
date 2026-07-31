import type { Level } from "../game/types";

/**
 * The same corner of town as the Thursday Social Run, seen from the other end:
 * the Observatory and its four northern neighbours, then everything above them
 * that the social run never bothers with. Roads heading south are, by club
 * tradition, somebody else's problem.
 *
 * Harder than the first two on purpose. Two landmarks at opposite ends of the
 * map, a distance window that only a full circuit satisfies, and two massive
 * hills you are allowed exactly one of.
 */
export const thursdayTownRun: Level = {
  id: "thursday-town-run",
  title: "Thursday Town Run",
  strapline: "It's flat again, obviously.",
  instructions:
    "Out of the Observatory and north into town, taking in the Wellington Statue and Aldershot Town Centre. There are two massive hills up there. You may have one.",
  theme: "town",

  objectives: [
    { kind: "start", detail: "Everyone gathers by the telescope, as ever." },
    { kind: "finish", detail: "Route closes the loop." },
    {
      kind: "distance",
      minKm: 7,
      maxKm: 8,
      tooLong: {
        title: "The Scenic Route, Apparently",
        message:
          "{km} km. You have taken a social run and turned it into an expedition. Two people have already texted their partners to say they will be late.",
      },
      tooShort: {
        title: "Barely Worth Changing For",
        message:
          "{km} km. The group has done more walking from the car park. The committee notes that the kettle had not even boiled.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["town-centre"],
      what: "Aldershot Town Centre",
      reportLabel: "Town centre reached",
      done: "Into town, past the shops, out again.",
      pending: "Nowhere near the town centre yet.",
      missed: {
        title: "You Skipped the Town",
        message:
          "A town run that never went into town. The club newsletter is going to have a field day with this one.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["wellington-statue"],
      what: "the Wellington Statue",
      reportLabel: "Statue saluted",
      done: "The Duke was saluted. He remained unmoved.",
      pending: "The Duke is still waiting.",
      missed: {
        title: "The Duke Is Not Amused",
        message:
          "You went all that way and did not once run past the enormous bronze man on the enormous bronze horse. He noticed. He always notices.",
      },
    },
    {
      kind: "max-node-type",
      nodeType: "hill",
      limit: 1,
      what: "massive hills",
      label: "Take in no more than 1 massive hill",
      fail: {
        title: "Two Hills. Two.",
        message:
          "Redan Road and the ski slope, in the same evening, on a run advertised as flat. Somebody has started a group chat without you in it.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "The Town Centre Was Dug Up",
        message:
          "You sent everyone down the road they have had fenced off since March. The group stood in front of the barrier and looked at you.",
      },
    },
  ],

  nodes: [
    {
      id: "observatory",
      labelAbove: true,
      x: 130,
      y: 480,
      label: "The Observatory",
      blurb: "start and finish",
      type: "observatory",
    },
    {
      id: "wellesley-rumble",
      labelSide: "left",
      x: 170,
      y: 360,
      label: "Wellesley Rumble",
      blurb: "nobody agrees what it is, everybody turns up",
    },
    {
      id: "medical-centre",
      labelAbove: true,
      x: 330,
      y: 350,
      label: "Medical Centre Toilet",
      blurb: "a quick pitstop, no questions asked",
    },
    {
      id: "hospital-hill",
      x: 500,
      y: 330,
      label: "Hospital Hill",
      blurb: "pigeon hotspot, and a hill about it",
      type: "pigeon",
      sprite: "hill",
    },
    {
      id: "big-tesco",
      x: 680,
      y: 355,
      label: "The Big Tesco",
      blurb: "the car park is a roundabout with ambitions",
      type: "shop",
      // Below the label rather than above the junction: the road up to the
      // statue leaves northwards and goes straight through the usual spot.
      // Nothing else is down here, this being the corner of the map.
      spriteDy: 78,
    },
    {
      id: "redan-road",
      // Not left: the hill marker draws on that side and lands on the text.
      labelAbove: true,
      x: 205,
      y: 230,
      label: "Redan Road",
      blurb: "massive hill, no arguments",
      type: "hill",
    },
    {
      id: "municipal-gardens",
      x: 350,
      y: 215,
      label: "Municipal Gardens",
      blurb: "bandstand, bins, and a swan with opinions",
      type: "park",
    },
    {
      id: "town-centre",
      labelSide: "right",
      x: 505,
      y: 195,
      label: "Aldershot Town Centre",
      blurb: "the clock is right twice a day",
      type: "towncentre",
      // Left and down off the road climbing away to the ski slope, which
      // otherwise clips the clock tower.
      spriteDx: -22,
      spriteDy: -38,
    },
    {
      id: "wellington-statue",
      labelSide: "right",
      x: 670,
      y: 205,
      // Long enough to wrap onto two lines, which is what keeps it inside the
      // map: one line of this length runs off the right-hand edge.
      label: "The Wellington Statue",
      blurb: "the Duke, on a horse, watching",
      type: "statue",
    },
    {
      id: "cemetery",
      // Roads leave downwards and to the right, and the headstones sit above,
      // so left is the only clear side for the writing — dropped a little so
      // it sits under the graves rather than alongside them.
      labelSide: "left",
      labelDy: 16,
      x: 330,
      y: 80,
      label: "The Cemetery",
      blurb: "quiet, flat, and full of people who ran their last 5K",
      type: "cemetery",
    },
    {
      id: "ski-slope",
      labelAbove: true,
      x: 600,
      y: 80,
      label: "The Ski Slope",
      blurb: "massive hill, and it is made of carpet",
      type: "hill",
    },
  ],

  roads: [
    { id: "obs-rumble", from: "observatory", to: "wellesley-rumble", distanceKm: 0.5 },
    { id: "obs-medical", from: "observatory", to: "medical-centre", distanceKm: 1 },
    {
      id: "rumble-redan",
      from: "wellesley-rumble",
      to: "redan-road",
      distanceKm: 0.6,
      hill: true,
    },
    {
      id: "rumble-medical",
      from: "wellesley-rumble",
      to: "medical-centre",
      distanceKm: 0.7,
    },
    {
      id: "medical-hospital",
      from: "medical-centre",
      to: "hospital-hill",
      distanceKm: 0.7,
      pigeonRisk: 0.6,
    },
    {
      id: "medical-gardens",
      from: "medical-centre",
      to: "municipal-gardens",
      distanceKm: 0.6,
    },
    {
      id: "hospital-tesco",
      from: "hospital-hill",
      to: "big-tesco",
      distanceKm: 0.8,
      pigeonRisk: 0.7,
    },
    {
      id: "hospital-centre",
      from: "hospital-hill",
      to: "town-centre",
      distanceKm: 0.6,
      closed: true,
    },
    { id: "tesco-statue", from: "big-tesco", to: "wellington-statue", distanceKm: 0.6 },
    {
      id: "redan-gardens",
      from: "redan-road",
      to: "municipal-gardens",
      distanceKm: 0.6,
    },
    {
      id: "redan-cemetery",
      from: "redan-road",
      to: "cemetery",
      distanceKm: 0.8,
      hill: true,
    },
    {
      id: "gardens-centre",
      from: "municipal-gardens",
      to: "town-centre",
      distanceKm: 0.7,
    },
    {
      id: "gardens-cemetery",
      from: "municipal-gardens",
      to: "cemetery",
      distanceKm: 0.6,
    },
    {
      id: "centre-statue",
      from: "town-centre",
      to: "wellington-statue",
      distanceKm: 0.7,
    },
    {
      id: "centre-ski",
      from: "town-centre",
      to: "ski-slope",
      distanceKm: 0.6,
      hill: true,
    },
    { id: "cemetery-ski", from: "cemetery", to: "ski-slope", distanceKm: 1.1 },
    {
      id: "ski-statue",
      from: "ski-slope",
      to: "wellington-statue",
      distanceKm: 0.6,
      hill: true,
    },
  ],

  startNodeId: "observatory",
  finishNodeId: "observatory",

  success: {
    title: "A Proper Town Run",
    message:
      "{km} km, both landmarks, and only the one hill. The Duke approves. Somebody is already claiming they could have done it faster.",
  },
  emptyRoute: {
    title: "Nobody Left the Observatory",
    message:
      "The group stood by the telescope discussing the route for forty minutes and then went to the pub. Traditional, but not a run.",
  },
  fallback: {
    title: "Questions Were Asked",
    message:
      "{km} km of something. The committee is drafting a document with headings.",
  },

  view: { width: 800, height: 560 },
};
