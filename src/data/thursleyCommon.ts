import type { Level } from "../game/types";

/**
 * Thursley Common: a National Nature Reserve of heath and peat bog between
 * Thursley and Elstead, and the club's furthest away run yet.
 *
 * The real place is 350 hectares of open heath with a boardwalk laid out over
 * the mire — the Dragonfly Trail, and the reason twenty-odd species of
 * dragonfly are the thing anybody comes for. That is what the level is built
 * round: the boardwalk is compulsory, the dragonflies are the flock, and the
 * mire is what happens if you leave the path.
 *
 * The Atlantic Wall is real too, and is next door on Hankley Common rather
 * than on the reserve proper — a full-size concrete replica of a stretch of
 * the Normandy defences, built in 1943 for the Canadians to practise blowing
 * up. The club has stretched the geography to take it in, as the club would.
 */
export const thursleyCommon: Level = {
  id: "thursley-common",
  title: "Thursley Common",
  strapline: "Mind the bog. Mind the dragonflies.",
  instructions:
    "An away run on the heath. Out over the boardwalk, round by the Atlantic Wall, and back to the car park — off the lanes, and no wading.",
  theme: "trail",
  flock: "dragonfly",

  objectives: [
    {
      kind: "start",
      detail: "Everyone in the Moat Pond car park, and nobody has paid for it.",
    },
    { kind: "finish", detail: "Back to the cars. Boots off in the boot." },
    {
      kind: "distance",
      minKm: 8,
      maxKm: 10,
      tooLong: {
        title: "Halfway to Hindhead",
        message:
          "{km} km. Somebody has taken the group most of the way to the Devil's Punch Bowl and is describing it as a loop.",
      },
      tooShort: {
        title: "That Was A Car Park Walk",
        message:
          "{km} km. The kettle in the boot is still warm. Nobody is counting that as an away run.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["boardwalk"],
      what: "the Boardwalk",
      reportLabel: "Boardwalk crossed",
      done: "Out over the mire on the boards, single file, nobody in the bog.",
      pending: "The boardwalk has not been crossed yet.",
      missed: {
        title: "You Came All This Way And Missed It",
        message:
          "An hour in the car to run round a nature reserve and give the dragonfly boardwalk a miss. It is the only reason anybody comes here.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["atlantic-wall"],
      what: "the Atlantic Wall",
      reportLabel: "Wall saluted",
      done: "Past the wall. Three people have now explained what it is.",
      pending: "Nowhere near the wall yet.",
      missed: {
        title: "The Wall Went Unvisited",
        message:
          "There is a full-size chunk of the Normandy defences on this heath and the route went round it. The committee will hear about this.",
      },
    },
    {
      kind: "avoid-surface",
      surface: "road",
      what: "the lanes",
      fail: {
        title: "Out On The Lanes Again",
        message:
          "Three hundred and fifty hectares of open heath and the group has found the one bit with a white line down the middle.",
      },
    },
    /*
     * Compulsory rather than capped, which is the opposite of what the birds
     * do everywhere else and is the right way round here. Pigeons are an
     * obstacle; dragonflies are the reason anybody drives to Thursley. Capping
     * them made the winning routes the ones that avoided the dragonflies on
     * the dragonfly level, and shut Gibbet View out of every legal loop into
     * the bargain.
     */
    {
      kind: "visit",
      nodeIds: ["pudmore"],
      what: "the dragonflies at Pudmore Pond",
      reportLabel: "Dragonflies seen",
      done: "Out past Pudmore with the whole lot up over the water.",
      pending: "No dragonflies yet.",
      missed: {
        title: "Not One Dragonfly",
        message:
          "Twenty-odd species live on this bog and the route went nowhere near any of them. There is a man with a very long lens who would like a word.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "The Bridleway Was Under Water",
        message:
          "It is shut from October and the sign says so in letters a foot high. Somebody is now wet to the knee and blaming the map.",
      },
    },
  ],

  nodes: [
    {
      id: "moat-car-park",
      x: 120,
      y: 430,
      label: "Moat Pond Car Park",
      blurb: "start and finish, free, and full by nine",
      type: "carpark",
    },
    {
      id: "moat-pond",
      labelSide: "left",
      x: 210,
      y: 300,
      label: "Moat Pond",
      blurb: "the one by the cars, with the ducks and the crisp packets",
      type: "shore",
    },
    {
      id: "boardwalk",
      labelAbove: true,
      x: 350,
      y: 250,
      label: "The Boardwalk",
      blurb: "the Dragonfly Trail, single file, no overtaking",
      /*
       * No landmark. It had the bridge from Tilford, and a bridge only reads
       * as one with water drawn under it — over a bog it was a grey hump on
       * the grass. The boards are what the roads either side of this junction
       * already are, so the name does the work.
       */
    },
    {
      id: "pudmore",
      x: 470,
      y: 175,
      label: "Pudmore Pond",
      blurb: "dragonfly hotspot, and they know you are there",
      type: "pigeon",
    },
    {
      id: "the-mire",
      labelSide: "right",
      x: 430,
      y: 355,
      label: "The Mire",
      blurb: "and the bridleway to it is under water",
      type: "mud",
      // Just west of straight down: the track to the sands leaves to the
      // south-east and the default offset lay along it.
      spriteDx: -10,
      spriteDy: 26,
    },
    {
      id: "pine-island",
      x: 265,
      y: 145,
      label: "Pine Island",
      blurb: "a stand of pines that is not an island",
      type: "woods",
    },
    {
      id: "hammer-pond",
      labelSide: "left",
      x: 600,
      y: 290,
      label: "Hammer Pond",
      blurb: "dragonfly hotspot, and the dam they keep rebuilding",
      type: "pigeon",
    },
    {
      id: "atlantic-wall",
      labelSide: "left",
      x: 640,
      y: 430,
      label: "The Atlantic Wall",
      blurb: "concrete, shelled, and still standing",
      type: "wall",
      /*
        * Ninety units of concrete, which is wider than anything else on the
        * roster and will not tuck in anywhere. Above lies across the dam track
        * from Hammer Pond and under the junction itself; below reaches into
        * the Hankley Sands label. South-east of both is the only clear ground,
        * with the name beside it rather than under it.
        *
        * The junction dot is drawn last and is solid white to a radius of
        * seventeen, so anything under it is not dimmed, it is gone. That is
        * now the rule for every landmark rather than an observation about this
        * one, and this one moved straight below to obey it.
        */
      spriteDx: 0,
      spriteDy: 40,
    },
    {
      id: "hankley-sands",
      labelSide: "right",
      x: 500,
      y: 490,
      label: "The Hankley Sands",
      blurb: "soft going, and the tank ruts have not filled in",
      type: "sand",
    },
    {
      id: "gibbet-view",
      labelSide: "right",
      x: 700,
      y: 150,
      label: "Gibbet View",
      blurb: "massive hill, and you can see London on a good day",
      type: "hill",
      /* Beside rather than above: above lays the name along the track down
         from Pudmore, and below puts it on the tree at (740, 200). */
      spriteDx: 10,
      spriteDy: 30,
    },
    {
      id: "three-horseshoes",
      labelSide: "right",
      x: 690,
      y: 60,
      label: "The Three Horseshoes",
      blurb: "the pub in Thursley, and the run's real finish line",
      type: "pub",
      /* A pub hangs sixty units above its junction, and this one is sixty from
         the top of the map, so it was drawn off the paper altogether. Thirty-
         five above instead: far enough to clear the junction's own dot, and
         still on the paper. West was tried and put it into the tree at
         610,70. */
      spriteDx: 0,
      spriteDy: -35,
    },
    {
      id: "elstead-green",
      labelAbove: true,
      x: 150,
      y: 90,
      label: "Elstead Green",
      blurb: "the village, the café, and a queue for both",
      type: "coffee",
      // Far enough below to clear the junction's dot, which was taking a bite
      // out of the van.
      spriteDx: -20,
      spriteDy: 35,
    },
  ],

  /*
   * Twelve junctions and nineteen roads, so rank 8 — the same band as Caesar's
   * Camp and comfortably clear of Tilford's eleven. See the density note in the
   * README before adding another road to this.
   */
  roads: [
    {
      id: "carpark-moat",
      from: "moat-car-park",
      to: "moat-pond",
      distanceKm: 0.6,
      surface: "trail",
    },
    {
      id: "moat-boardwalk",
      from: "moat-pond",
      to: "boardwalk",
      distanceKm: 0.7,
      surface: "trail",
    },
    {
      id: "boardwalk-pudmore",
      from: "boardwalk",
      to: "pudmore",
      distanceKm: 0.8,
      surface: "trail",
      pigeonRisk: 0.9,
    },
    {
      id: "boardwalk-mire",
      from: "boardwalk",
      to: "the-mire",
      distanceKm: 0.7,
      surface: "trail",
    },
    {
      /* The bridleway, which is under 600 mm of water from October and is
         signed accordingly. Real, and a better closure than the dam works:
         the whole reserve is a bog and this is the bit of it that catches
         people out. */
      id: "moat-mire",
      from: "moat-pond",
      to: "the-mire",
      distanceKm: 1.1,
      surface: "trail",
      closed: true,
    },
    {
      id: "carpark-mire",
      from: "moat-car-park",
      to: "the-mire",
      distanceKm: 1.6,
      surface: "trail",
    },
    {
      id: "pine-boardwalk",
      from: "pine-island",
      to: "boardwalk",
      distanceKm: 0.9,
      surface: "trail",
    },
    {
      id: "pine-pudmore",
      from: "pine-island",
      to: "pudmore",
      distanceKm: 1.2,
      surface: "trail",
      pigeonRisk: 0.5,
    },
    {
      id: "elstead-pine",
      from: "elstead-green",
      to: "pine-island",
      distanceKm: 1.0,
    },
    {
      id: "elstead-moat",
      from: "elstead-green",
      to: "moat-pond",
      distanceKm: 2.1,
    },
    {
      id: "pudmore-hammer",
      from: "pudmore",
      to: "hammer-pond",
      distanceKm: 1.3,
      surface: "trail",
      pigeonRisk: 0.7,
    },
    {
      id: "pudmore-gibbet",
      from: "pudmore",
      to: "gibbet-view",
      distanceKm: 1.7,
      surface: "trail",
      hill: true,
    },
    {
      id: "gibbet-horseshoes",
      from: "gibbet-view",
      to: "three-horseshoes",
      distanceKm: 0.9,
    },
    {
      /* The hill's second way off. Without this the only trail to Gibbet View
         is the one from Pudmore, which makes it a dead end no loop can take
         in — a junction drawn on the map and impossible to visit. */
      id: "gibbet-hammer",
      from: "gibbet-view",
      to: "hammer-pond",
      distanceKm: 1.6,
      surface: "trail",
      hill: true,
    },
    {
      id: "horseshoes-hammer",
      from: "three-horseshoes",
      to: "hammer-pond",
      distanceKm: 1.8,
    },
    {
      id: "hammer-dam",
      from: "hammer-pond",
      to: "atlantic-wall",
      distanceKm: 1.0,
      surface: "trail",
    },
    {
      id: "mire-hammer",
      from: "the-mire",
      to: "hammer-pond",
      distanceKm: 1.5,
      surface: "trail",
    },
    {
      id: "mire-sands",
      from: "the-mire",
      to: "hankley-sands",
      distanceKm: 1.4,
      surface: "trail",
    },
    {
      id: "sands-wall",
      from: "hankley-sands",
      to: "atlantic-wall",
      distanceKm: 1.2,
      surface: "trail",
    },
    {
      id: "carpark-sands",
      from: "moat-car-park",
      to: "hankley-sands",
      distanceKm: 2.0,
      surface: "trail",
    },
  ],

  startNodeId: "moat-car-park",
  finishNodeId: "moat-car-park",

  success: {
    title: "A Proper Away Run",
    message:
      "{km} km of heath, one boardwalk, one lot of dragonflies and a concrete wall nobody could explain. Everybody is filthy and nobody is complaining.",
  },
  emptyRoute: {
    title: "Still In The Car Park",
    message:
      "Twelve people, four cars, one map on a phone with no signal. Pick somewhere to run to.",
  },
  fallback: {
    title: "Left On The Heath",
    message:
      "The route stops out on the common. It is all gorse and sand out there and it all looks the same.",
  },

  /*
   * Leads are compulsory on the reserve from April to September, which is
   * exactly the sort of rule somebody's dog has never heard of. Run past it on
   * the way to the dragonflies and it comes too.
   */
  followers: [{ kind: "dog", nodeId: "the-mire", dx: -46, dy: 26 }],

  scatter: [
    { x: 300, y: 60, kind: "gorse", variant: 1 },
    { x: 560, y: 90, kind: "gorse" },
    { x: 55, y: 250, kind: "gorse", variant: 1 },
    { x: 760, y: 240, kind: "rock" },
    { x: 330, y: 505, kind: "gorse" },
    { x: 250, y: 520, kind: "rock" },
    { x: 60, y: 520, kind: "bench" },
    { x: 720, y: 350, kind: "butterfly" },
    { x: 92, y: 158, kind: "butterfly" },
    { x: 610, y: 520, kind: "warning" },
    { x: 430, y: 90, kind: "tree" },
    { x: 760, y: 480, kind: "tree" },
  ],

  view: { width: 800, height: 560 },
};
