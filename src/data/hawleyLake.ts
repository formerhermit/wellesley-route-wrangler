import type { Level } from "../game/types";

/**
 * The eighth level, and the first built round open water. The lake is drawn
 * from the ring of four bank junctions, the same mechanism as Fleet Pond, and
 * the circuit runs round the outside of it.
 *
 * Everything else here is Ministry of Defence land: warning signs, a range
 * road shut without explanation, and the toy soldiers from Caesar's Camp,
 * who have apparently been reassigned.
 */
export const hawleyLake: Level = {
  id: "hawley-lake",
  title: "Hawley Lake",
  strapline: "Mud, sand, and a lake in the way.",
  instructions:
    "Round the water from the Sailing Centre, taking in Minley Manor and the birds at Bird Bay. There are two epic hills and you may have one, and the range road is shut, whatever the group tells you.",
  theme: "trail",
  flock: "duck",

  objectives: [
    { kind: "start", detail: "Everyone meets by the boats, as instructed." },
    { kind: "finish", detail: "Back at the Sailing Centre, all present." },
    {
      kind: "distance",
      minKm: 9,
      maxKm: 11.5,
      tooLong: {
        title: "Round The Lake Twice",
        message:
          "{km} km. The lake is not that big. Somebody has been round the far end for reasons they are struggling to explain.",
      },
      tooShort: {
        title: "You Saw One End Of It",
        message:
          "{km} km. There is a whole other side to this lake and the group has not been anywhere near it.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["minley-manor"],
      what: "Minley Manor",
      reportLabel: "Manor admired",
      done: "Up the avenue, past the sequoias, one photograph of the tower.",
      pending: "The Manor has not been visited.",
      missed: {
        title: "The Manor Went Unseen",
        message:
          "You came all the way to Minley and never went up the avenue. There is a French château at the top of it and the group has run past the end of the drive.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["bird-bay"],
      what: "Bird Bay",
      reportLabel: "Birds greeted",
      done: "Ducks counted, goose accounted for, goose now following.",
      pending: "The birds have not been greeted.",
      missed: {
        title: "The Birds Were Not Greeted",
        message:
          "A run round a lake that never went near the birds. The ducks are unbothered. The goose is not, and it knows where you started.",
      },
      stranded: {
        title: "Nobody Left Bird Bay",
        message:
          "The group reached the bay, fed the ducks the last of somebody's flapjack, and simply stayed.",
      },
    },
    {
      kind: "max-node-type",
      nodeType: "hill",
      limit: 1,
      what: "epic hills",
      label: "Take in no more than 1 epic hill",
      fail: {
        title: "Both Hills. In One Evening.",
        message:
          "Cricket Hill and Beacon Hill, back to back, on a run sold as a lap of a lake. Two people have sat down on the heather and are refusing to discuss it.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "That Range Road Is Shut",
        message:
          "There were signs. There were three of them, all red, all triangular. The group is now being addressed at length by somebody in uniform.",
      },
    },
  ],

  success: {
    title: "A Textbook Lap Of Hawley",
    message:
      "{km} km, the Manor admired, the birds greeted, and nobody at all on the range. The goose came with you and shows no sign of leaving.",
  },
  emptyRoute: {
    title: "Still At The Sailing Centre",
    message:
      "The group stood watching a dinghy fail to get anywhere for twenty minutes, and then it started raining.",
  },
  fallback: {
    title: "Everybody Is Filthy",
    message:
      "{km} km, most of it apparently through the mud. Nobody is getting in a car until somebody produces a towel.",
  },

  nodes: [
    // The bank. Four of these draw the water they enclose, so the order here
    // is the order round the lake and not a list.
    {
      id: "sailing-centre",
      x: 255,
      y: 175,
      label: "The Sailing Centre",
      blurb: "start and finish, and the only building with a kettle",
      type: "shore",
      sprite: "sailing",
      // Beside, not above: the name has to go somewhere the boats are not.
      labelSide: "left",
      // And the boats moor on the water, which is off to the south-east.
      spriteDx: 55,
      spriteDy: 40,
    },
    {
      id: "the-spit",
      x: 470,
      y: 145,
      label: "The Spit",
      blurb: "a finger of gravel nobody has explained",
      type: "shore",
      labelAbove: true,
    },
    {
      id: "hecking-sand",
      x: 615,
      y: 305,
      label: "Hecking Sand",
      blurb: "sand, in Hampshire, for no reason anybody can give",
      type: "shore",
      sprite: "sand",
      // Two lines under the junction: on one line, beside it, the name
      // reached the road the Ministry has shut.
      labelWrap: true,
      labelDy: 10,
      // Which leaves the beach to sit on the shore to the west.
      spriteDx: -58,
      spriteDy: 6,
    },
    {
      id: "the-mud-bath",
      x: 390,
      y: 420,
      label: "The Mud Bath",
      blurb: "ankle deep in June, worse in January",
      type: "shore",
      sprite: "mud",
      // Below its name rather than behind it.
      spriteDy: 58,
    },

    // Everything the circuit hangs off.
    {
      id: "bird-bay",
      // Left: the flock loiters to the right of its hotspot, and one of them
      // was standing in the name.
      labelSide: "left",
      x: 585,
      y: 185,
      label: "Bird Bay",
      blurb: "ducks, and one goose with a long memory",
      type: "pigeon",
    },
    {
      id: "minley-manor",
      x: 160,
      y: 120,
      label: "Minley Manor",
      blurb: "a French château, in Hampshire, up an avenue of sequoias",
      type: "manor",
      labelAbove: true,
      // Its tower is tall enough to leave the map from where a manor usually
      // sits, so this one sits lower.
      spriteDy: -62,
    },
    {
      id: "hawley-woods",
      labelSide: "right",
      x: 105,
      y: 290,
      label: "Hawley Woods",
      blurb: "pines, and a great many of them",
      type: "woods",
      // Due west: the lane up to the Manor leaves northwards, through where
      // the trees were drawn.
      spriteDx: -55,
      spriteDy: 0,
    },
    {
      id: "the-portaloos",
      x: 175,
      y: 455,
      label: "The Portaloos",
      blurb: "unexpectedly welcome, again",
      type: "portaloo",
      labelAbove: true,
    },
    {
      id: "gorse-corner",
      x: 330,
      y: 520,
      label: "Gorse Corner",
      blurb: "yellow, spiky, and slightly on fire every August",
      labelAbove: true,
    },
    {
      id: "mod-gate",
      labelAbove: true,
      x: 715,
      y: 150,
      label: "The MOD Gate",
      blurb: "signs, a barrier, and absolutely no explanation",
      type: "hangar",
      // High enough to clear its own name, which now sits between the two.
      spriteDy: -78,
    },
    {
      id: "cricket-hill",
      labelSide: "left",
      x: 730,
      y: 415,
      label: "Cricket Hill",
      blurb: "epic hill, and the view is genuinely worth it",
      type: "hill",
      // Below the junction: its name is on the left, where a hill marker goes.
      spriteDx: 0,
      spriteDy: 40,
    },
    {
      id: "beacon-hill",
      x: 545,
      y: 505,
      label: "Beacon Hill",
      blurb: "epic hill, no view whatsoever",
      type: "hill",
      labelAbove: true,
      // Just clear of the track in from Gorse Corner, which ran through it.
      spriteDx: -30,
      spriteDy: 26,
    },
  ],

  roads: [
    // Round the water, which is the run everybody came for.
    { id: "sailing-spit", from: "sailing-centre", to: "the-spit", distanceKm: 1.1, surface: "trail" },
    { id: "spit-bay", from: "the-spit", to: "bird-bay", distanceKm: 0.8, surface: "trail" },
    { id: "bay-sand", from: "bird-bay", to: "hecking-sand", distanceKm: 1.2, surface: "trail" },
    { id: "sand-mud", from: "hecking-sand", to: "the-mud-bath", distanceKm: 1.4, surface: "trail" },
    { id: "mud-sailing", from: "the-mud-bath", to: "sailing-centre", distanceKm: 1.5, surface: "trail" },

    // West, through the woods and up the avenue to the Manor.
    { id: "sailing-woods", from: "sailing-centre", to: "hawley-woods", distanceKm: 0.9, surface: "trail" },
    { id: "woods-manor", from: "hawley-woods", to: "minley-manor", distanceKm: 1.6, surface: "trail" },
    { id: "manor-spit", from: "minley-manor", to: "the-spit", distanceKm: 1.8, surface: "trail" },
    { id: "manor-sailing", from: "minley-manor", to: "sailing-centre", distanceKm: 1.3, surface: "trail" },

    // South, past the portaloos and round the gorse.
    { id: "woods-loos", from: "hawley-woods", to: "the-portaloos", distanceKm: 1.1, surface: "trail" },
    { id: "loos-gorse", from: "the-portaloos", to: "gorse-corner", distanceKm: 0.9, surface: "trail" },
    { id: "gorse-mud", from: "gorse-corner", to: "the-mud-bath", distanceKm: 0.9, surface: "trail" },
    { id: "gorse-beacon", from: "gorse-corner", to: "beacon-hill", distanceKm: 1.2, surface: "trail", hill: true },

    // The hills, and the ground the Ministry would rather you kept off.
    { id: "beacon-cricket", from: "beacon-hill", to: "cricket-hill", distanceKm: 1.4, surface: "trail", hill: true },
    { id: "cricket-sand", from: "cricket-hill", to: "hecking-sand", distanceKm: 1.1, surface: "trail" },
    { id: "mud-beacon", from: "the-mud-bath", to: "beacon-hill", distanceKm: 1.2, surface: "trail" },
    { id: "bay-gate", from: "bird-bay", to: "mod-gate", distanceKm: 0.8, surface: "trail", pigeonRisk: 0.5 },
    {
      // Shut, and signposted as shut, three times over.
      id: "gate-cricket",
      from: "mod-gate",
      to: "cricket-hill",
      distanceKm: 1.3,
      surface: "trail",
      closed: true,
    },
  ],

  startNodeId: "sailing-centre",
  finishNodeId: "sailing-centre",

  // The goose from the Jetty, the paddling spot and the pond, now here.
  follower: { kind: "goose", nodeId: "bird-bay", dx: -34, dy: 44 },

  scatter: [
    // On the water: two islands nobody has landed on, and the dinghies.
    { x: 400, y: 220, kind: "island" },
    { x: 480, y: 300, kind: "island" },
    { x: 360, y: 260, kind: "boat" },
    { x: 520, y: 240, kind: "boat" },
    { x: 440, y: 320, kind: "boat" },

    // The avenue: giant sequoias and limes, planted alternately by somebody
    // who did not expect the sequoias to win.
    { x: 320, y: 60, kind: "wellingtonia" },
    { x: 380, y: 60, kind: "tree" },
    { x: 440, y: 60, kind: "wellingtonia" },
    { x: 500, y: 60, kind: "tree" },

    // The woods, and what is in them.
    { x: 60, y: 340, kind: "alpine" },
    { x: 180, y: 320, kind: "alpine" },

    // Heath: gorse, yellow and purple, and cows that have got out again.
    { x: 280, y: 340, kind: "gorse", variant: 1 },
    { x: 620, y: 420, kind: "gorse", variant: 1 },
    { x: 640, y: 520, kind: "gorse", variant: 1 },
    { x: 120, y: 500, kind: "gorse", variant: 1 },
    { x: 240, y: 520, kind: "gorse" },
    { x: 440, y: 480, kind: "gorse" },
    { x: 620, y: 500, kind: "gorse" },
    { x: 100, y: 400, kind: "cow" },
    { x: 300, y: 440, kind: "cow", flip: true },

    // Dogs, off the lead and unaccompanied, as ever.
    { x: 240, y: 400, kind: "dog" },
    { x: 540, y: 440, kind: "dog", flip: true },
    { x: 680, y: 480, kind: "dog" },

    // The Ministry: soldiers who were on Caesar's Camp last week, and the
    // signs that explain the road nobody may use.
    { x: 620, y: 120, kind: "soldier", variant: 0 },
    { x: 560, y: 140, kind: "soldier", variant: 3 },
    { x: 680, y: 240, kind: "soldier", variant: 2, flip: true },
    { x: 660, y: 290, kind: "soldier", variant: 1 },
    { x: 690, y: 340, kind: "soldier", variant: 3, flip: true },
    { x: 760, y: 260, kind: "warning" },
    { x: 760, y: 380, kind: "warning" },

    // Sand and gravel country, so: rocks.
    { x: 560, y: 60, kind: "rock" },
    { x: 220, y: 240, kind: "rock" },
    { x: 260, y: 460, kind: "rock" },
    { x: 500, y: 400, kind: "rock" },
    { x: 75, y: 430, kind: "rock" },
    { x: 740, y: 480, kind: "rock" },
  ],

  view: { width: 800, height: 560 },
};
