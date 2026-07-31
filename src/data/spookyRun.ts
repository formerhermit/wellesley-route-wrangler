import type { Level } from "../game/types";

/**
 * The Town Run map, on the last Thursday in October, after dark. The Big
 * Tesco and the Duke are not on this one — the club has never once got that
 * far east in the dark — and in their place are a street of trick or treaters
 * and an alley nobody will go down twice.
 *
 * Everything spooky about it is declared here: the light (`mood`), the birds
 * (`flock`) and the music. The rules in `src/game/` know none of it.
 */
export const spookyRun: Level = {
  id: "spooky-run",
  title: "Spooky Run",
  strapline: "Something is following the group.",
  instructions:
    "The Thursday town loop, run in the dark. Take in the church and the town centre, keep to one hill, and whatever you do, stay out of the streets full of trick or treaters.",
  theme: "town",
  mood: "dusk",
  flock: "crow",
  music: "halloween-theme.mp3",

  objectives: [
    { kind: "start", detail: "Head torches on. Two people have brought none." },
    { kind: "finish", detail: "Everyone back. Everyone counted. Twice." },
    {
      kind: "distance",
      minKm: 6.6,
      maxKm: 7,
      tooLong: {
        title: "Out Well Past Dark",
        message:
          "{km} km. It is properly black now and somebody's torch has gone. The group is holding hands and pretending it is for safety.",
      },
      tooShort: {
        title: "Home Before The Streetlights",
        message:
          "{km} km. Nobody was frightened, nobody got lost, and nobody is calling that a Spooky Run.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["spooky-church"],
      what: "the Spooky Church",
      reportLabel: "Church passed",
      done: "Past the church. The bell went. Nobody has explained that.",
      pending: "The church has not been passed yet.",
      missed: {
        title: "The Church Went Unvisited",
        message:
          "A Spooky Run that gave the spooky church a wide berth. The one genuinely haunted building in Wellesley and you took the group round it.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["town-centre"],
      what: "Aldershot Town Centre",
      reportLabel: "Town centre reached",
      done: "Into town, past the shops, out again, faster than usual.",
      pending: "Nowhere near the town centre yet.",
      missed: {
        title: "You Skipped the Town",
        message:
          "A town run that never went into town. On Halloween the club newsletter has a whole page for this sort of thing.",
      },
    },
    {
      kind: "max-node-type",
      nodeType: "treaters",
      limit: 0,
      what: "streets of trick or treaters",
      label: "Steer clear of the trick or treaters",
      fail: {
        title: "Surrounded By Small Witches",
        message:
          "You ran a group of adults in matching vests into a street of trick or treaters. It took nine minutes to get through and somebody has been given a sweet.",
      },
    },
    {
      kind: "max-node-type",
      nodeType: "hill",
      limit: 1,
      what: "massive hills",
      label: "Take in no more than 1 massive hill",
      fail: {
        title: "Two Hills. In The Dark.",
        message:
          "Redan Road and the ski slope, at night, in October. The group has stopped talking to you and one of them is talking to the crows.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "The Town Centre Was Still Dug Up",
        message:
          "The fence has been there since March and it is no easier to see at night. Somebody has gone straight into it.",
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
      blurb: "start and finish, and the only lit building",
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
      id: "spooky-church",
      x: 120,
      y: 295,
      label: "The Spooky Church",
      blurb: "the bell goes on its own",
      type: "church",
      labelSide: "right",
      labelDy: 14,
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
      blurb: "crow hotspot, and a hill about it",
      type: "pigeon",
      sprite: "hill",
      // Below the label rather than beside the junction: the lane west to the
      // Medical Centre runs through where a hill usually sits.
      spriteDy: 60,
    },
    {
      id: "sweet-street",
      x: 680,
      y: 355,
      label: "Full-Size Bar Street",
      blurb: "trick or treaters, forty deep, and they know",
      type: "treaters",
      labelDy: 8,
      // Left of the junction: the lane up to the alley runs through the middle
      // of them, which is roughly what it feels like.
      spriteDx: -50,
      spriteDy: -44,
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
      // Down and to the right, out of the churchyard: the church stands where
      // this hill's marker usually sits.
      spriteDx: 30,
      spriteDy: 22,
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
      id: "dark-alley",
      labelSide: "right",
      x: 670,
      y: 205,
      label: "The Dark Alley",
      blurb: "something white went past, twice",
      type: "ghost",
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
      blurb: "busier tonight than it has any right to be",
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
    // Up the lane to the churchyard gate. Without it the church could only be
    // reached over Redan Road, and which hill you spend would not be a choice.
    { id: "obs-church", from: "observatory", to: "spooky-church", distanceKm: 0.9 },

    // The old Rumble–Redan hill, with the church now standing in the middle
    // of it. Same climb, in two halves.
    {
      id: "rumble-church",
      from: "wellesley-rumble",
      to: "spooky-church",
      distanceKm: 0.3,
    },
    {
      id: "church-redan",
      from: "spooky-church",
      to: "redan-road",
      distanceKm: 0.4,
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

    // East, where the Big Tesco and the Duke used to be.
    {
      id: "hospital-sweet",
      from: "hospital-hill",
      to: "sweet-street",
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
    { id: "sweet-alley", from: "sweet-street", to: "dark-alley", distanceKm: 0.6 },
    // The way back off the east side that is neither shut, uphill, nor full of
    // children. With the Duke gone, without this there is no way through town.
    {
      id: "alley-hospital",
      from: "dark-alley",
      to: "hospital-hill",
      distanceKm: 0.9,
      pigeonRisk: 0.5,
    },
    { id: "centre-alley", from: "town-centre", to: "dark-alley", distanceKm: 0.7 },
    {
      id: "alley-ski",
      from: "dark-alley",
      to: "ski-slope",
      distanceKm: 0.6,
      hill: true,
    },

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
      id: "centre-ski",
      from: "town-centre",
      to: "ski-slope",
      distanceKm: 0.6,
      hill: true,
    },
    { id: "cemetery-ski", from: "cemetery", to: "ski-slope", distanceKm: 1.1 },
  ],

  startNodeId: "observatory",
  finishNodeId: "observatory",

  success: {
    title: "A Properly Spooky Run",
    message:
      "{km} km in the dark, church and town centre both, one hill, and not a single trick or treater. Something followed the group the whole way and nobody has mentioned it.",
  },
  emptyRoute: {
    title: "Nobody Left the Observatory",
    message:
      "The group stood by the telescope, looked at how dark it was, and stayed exactly where they were.",
  },
  fallback: {
    title: "Something Went Wrong Out There",
    message:
      "{km} km, and the group has come back changed. The committee is drafting a document with headings and one of the headings is 'The Noise'.",
  },

  view: { width: 800, height: 560 },
};
