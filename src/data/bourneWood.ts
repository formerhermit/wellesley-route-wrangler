import type { Level } from "../game/types";

/**
 * Bourne Wood, which is two kilometres south of Farnham and is also, on and
 * off since 1999, Germania, Sherwood, Asgard, the Western Front and a good
 * deal of Middle England (#113).
 *
 * All of it is real, including the silly parts. Forestry England runs the wood
 * and says outright that it is strategically important to the British film
 * industry. Gladiator was the first to use it and burned a stand of conifers
 * doing it; the opening battle is Bourne Wood with the smoke machines on.
 * Since then: Band of Brothers, Children of Men, Robin Hood, The Wolfman, two
 * Deathly Hallows, Captain America, War Horse, Snow White and the Huntsman,
 * Thor, Jack the Giant Slayer, Avengers, Transformers, Wonder Woman, Jurassic
 * World, The Old Guard, The Witcher, Napoleon, Sonic 3 and House of the
 * Dragon. It is a conifer plantation on the Greensand Ridge with a promontory
 * over a heathland clearing, and the clearing is the bit you have seen.
 *
 * The rest is older. There are two Bronze Age round barrows in the wood,
 * twenty-odd metres across and about a metre high. The Canadians put a
 * searchlight post in the northernmost corner in the war and the concrete is
 * still there. The RSPB has bought parts of it back off the conifers and is
 * turning them into heath again as Farnham Heath. Down the hill, Waverley
 * Abbey was the first Cistercian house in England, founded 1128, and Mother
 * Ludlam's Cave in the sandstone at Moor Park is where a monk named Symon
 * found the spring that supplied it from 1218, after the abbey's own dried up.
 *
 * The design is deliberately plain after Crooksbury. That map introduced a
 * whole new objective and this one introduces none: it is start, finish,
 * distance, two waypoints and a closure, which is the level 1 rule set. What
 * is new here is the drawing — a unit truck, a camera on sticks, a
 * clapperboard, a director's chair, a barrow, a cave and a searchlight — and
 * a level whose whole joke is *where it is* does not also need a rule nobody
 * has met before. The closure is the film unit, and it is the only closure in
 * the game that is somebody else's fault twice over.
 *
 * Daylight, the house theme, no flock of its own.
 */
export const bourneWood: Level = {
  id: "bourne-wood",
  title: "Bourne Wood",
  strapline: "You have definitely seen this wood before.",
  instructions:
    "Out through the clearing they filmed Gladiator in, down to Waverley Abbey and back up. Something is being filmed today and the unit has half the wood coned off.",
  theme: "trail",
  startNodeId: "bourne-car-park",
  finishNodeId: "bourne-car-park",
  view: { width: 800, height: 560 },

  nodes: [
    {
      id: "bourne-car-park",
      x: 250,
      y: 210,
      label: "Bourne Wood Car Park",
      blurb: "pay and display, and the machine takes cards now",
      type: "carpark",
      labelAbove: true,
      // Left of the junction. Above is a two-line name and right was under
      // the junction's own dot, which is solid white and drawn last.
      spriteDx: -40,
      spriteDy: 0,
    },
    {
      id: "the-searchlight",
      x: 200,
      y: 105,
      label: "The Searchlight",
      blurb: "Canadian, 1941, and still pointing wherever they left it",
      type: "searchlight",
      // Left, because right is the track to Lower Bourne and the name lay along it.
      labelSide: "left",
    },
    {
      id: "lower-bourne",
      x: 335,
      y: 112,
      label: "Lower Bourne",
      blurb: "the village, and the last pavement for an hour",
      type: "shop",
    },
    {
      id: "unit-base",
      x: 440,
      y: 190,
      label: "Unit Base",
      blurb: "nine white trucks and a queue for the catering bus",
      type: "filmunit",
      labelSide: "right",
    },
    {
      id: "the-clearing",
      x: 320,
      y: 300,
      label: "The Clearing",
      blurb: "Germania, Sherwood, Asgard, and a bit of Surrey",
      type: "filmset",
    },
    {
      id: "the-promontory",
      x: 250,
      y: 395,
      label: "The Promontory",
      blurb: "the view over the whole thing, and where the crane goes",
      type: "hill",
      labelSide: "left",
      // Above. Left is where the name is and below was under the dot.
      spriteDx: 0,
      spriteDy: -30,
    },
    {
      id: "the-barrows",
      x: 355,
      y: 470,
      label: "The Round Barrows",
      blurb: "Bronze Age, and a metre high if you know to look",
      type: "barrow",
      labelAbove: true,
    },
    {
      id: "farnham-heath",
      x: 520,
      y: 420,
      label: "Farnham Heath",
      blurb: "conifers off, heather back, courtesy of the RSPB",
      type: "sand",
      // Above the junction. Sand sits below by default and so does this name.
      spriteDx: 0,
      spriteDy: -35,
    },
    {
      id: "waverley-abbey",
      x: 675,
      y: 330,
      label: "Waverley Abbey",
      blurb: "1128, and the first Cistercian house in England",
      type: "church",
      labelSide: "left",
      // Up and right of the junction: above it is the lane down from the cave,
      // and level with it the dot was standing in the west wall.
      spriteDx: 40,
      spriteDy: -30,
    },
    {
      id: "mother-ludlams-cave",
      x: 700,
      y: 170,
      label: "Mother Ludlam's Cave",
      blurb: "the Ludwell, which watered the abbey from 1218",
      type: "cave",
      labelAbove: true,
      // Out to the side, clear of its own rather long name — and far enough
      // out to clear the junction's dot, which was taking the mouth off it.
      spriteDx: 40,
      spriteDy: 0,
    },
    {
      id: "moor-park",
      x: 540,
      y: 130,
      label: "Moor Park",
      blurb: "where Swift worked and was rude about everybody",
      type: "manor",
    },
    {
      id: "rowledge",
      x: 90,
      y: 300,
      label: "Rowledge",
      blurb: "a village with one road in and the same road out",
      type: "pub",
      labelSide: "right",
    },
  ],

  /*
   * The closure is the film unit, and it is placed where it hurts: the direct
   * track from Unit Base into the Clearing is the short way in, and while they
   * are turning over it is cones and a man in a tabard. Everything else about
   * this map is ordinary, so the whole puzzle is getting to the Clearing the
   * long way round and still getting home inside the distance.
   */
  roads: [
    { id: "carpark-searchlight", from: "bourne-car-park", to: "the-searchlight", distanceKm: 0.5, surface: "trail" },
    { id: "searchlight-bourne", from: "the-searchlight", to: "lower-bourne", distanceKm: 0.7, surface: "trail" },
    { id: "carpark-bourne", from: "bourne-car-park", to: "lower-bourne", distanceKm: 0.9 },
    { id: "bourne-unit", from: "lower-bourne", to: "unit-base", distanceKm: 1.0 },
    { id: "carpark-clearing", from: "bourne-car-park", to: "the-clearing", distanceKm: 0.8, surface: "trail" },
    {
      id: "unit-clearing",
      from: "unit-base",
      to: "the-clearing",
      distanceKm: 0.7,
      surface: "trail",
      // Turning over. The short way in, and shut.
      closed: true,
    },
    { id: "unit-moor", from: "unit-base", to: "moor-park", distanceKm: 1.1 },
    { id: "moor-cave", from: "moor-park", to: "mother-ludlams-cave", distanceKm: 0.9, surface: "trail" },
    { id: "cave-waverley", from: "mother-ludlams-cave", to: "waverley-abbey", distanceKm: 0.9, surface: "trail" },
    { id: "waverley-heath", from: "waverley-abbey", to: "farnham-heath", distanceKm: 1.3, surface: "trail" },
    { id: "heath-clearing", from: "farnham-heath", to: "the-clearing", distanceKm: 1.2, surface: "trail" },
    { id: "heath-barrows", from: "farnham-heath", to: "the-barrows", distanceKm: 1.1, surface: "trail" },
    { id: "barrows-clearing", from: "the-barrows", to: "the-clearing", distanceKm: 0.9, surface: "trail" },
    { id: "barrows-promontory", from: "the-barrows", to: "the-promontory", distanceKm: 0.7, surface: "trail", hill: true },
    { id: "promontory-clearing", from: "the-promontory", to: "the-clearing", distanceKm: 0.8, surface: "trail", hill: true },
    { id: "promontory-rowledge", from: "the-promontory", to: "rowledge", distanceKm: 1.3, surface: "trail" },
    { id: "rowledge-carpark", from: "rowledge", to: "bourne-car-park", distanceKm: 1.2 },
  ],

  /* Hardstanding: the forest car park, and the hard ground the unit parks on. */
  ground: [
    { x: 190, y: 176, width: 120, height: 72, rx: 12 },
    { x: 384, y: 224, width: 132, height: 78, rx: 12 },
  ],

  scatter: [
    // The unit, parked where the trucks can turn round. There are always more
    // of them than the wood looks like it can hold.
    { x: 480, y: 260, kind: "unittruck" },
    { x: 560, y: 260, kind: "unittruck" },
    { x: 620, y: 260, kind: "directorchair" },
    { x: 220, y: 300, kind: "clapperboard" },
    // And the wood itself, which is a conifer plantation whenever nobody is
    // filming a battle in it.
    { x: 100, y: 40, kind: "alpine" },
    { x: 140, y: 60, kind: "alpine" },
    { x: 700, y: 60, kind: "alpine" },
    { x: 660, y: 480, kind: "alpine" },
    { x: 100, y: 500, kind: "alpine" },
    { x: 140, y: 240, kind: "gorse" },
    { x: 60, y: 380, kind: "rock" },
    { x: 620, y: 480, kind: "bench" },
    { x: 160, y: 460, kind: "dog" },
  ],

  objectives: [
    { kind: "start", detail: "In the forest car park, arguing about the machine." },
    { kind: "finish", detail: "Back at the cars, having seen nobody famous." },
    {
      kind: "distance",
      minKm: 9.5,
      maxKm: 11,
      tooLong: {
        title: "The Extended Edition",
        message:
          "{km} km. Somebody kept going to see whether the trucks had moved. They had not.",
      },
      tooShort: {
        title: "That Was The Trailer",
        message: "{km} km, and half the club is still in the car park.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["the-clearing"],
      what: "the Clearing",
      reportLabel: "Battlefield reached",
      done: "Across the clearing. Russell Crowe stood roughly there.",
      pending: "The Clearing is still out there, being Germania.",
      missed: {
        title: "Ran Past Rome Entirely",
        message:
          "A run to Bourne Wood that missed the one field anybody has heard of. It has been Germania, Sherwood and Asgard and today it was nothing at all.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["waverley-abbey"],
      what: "Waverley Abbey",
      reportLabel: "Abbey seen",
      done: "Past the abbey. Nine hundred years, and still more ruin than most.",
      pending: "Waverley Abbey is down on the Wey, unvisited.",
      missed: {
        title: "Nine Hundred Years, Ignored",
        message:
          "The first Cistercian house in England is twenty minutes away and the club has been round a car park instead.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "You Are In The Shot",
        message:
          "Somebody has taken the group straight through a closed set. Eleven people in club vests are now in a Netflix series set in 1487.",
      },
    },
  ],

  success: {
    title: "Two Thousand Years In One Loop",
    message:
      "{km} km, the clearing, the abbey, and not one of you in the background of anything. Somebody is already telling people they were in Gladiator.",
  },
  emptyRoute: {
    title: "Still Reading The Sign",
    message: "The car park machine takes cards now and nobody believes it.",
  },
  fallback: {
    title: "Cut. Going Again.",
    message: "{km} km, and the committee would like another take.",
  },
};
