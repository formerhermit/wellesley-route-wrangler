import type { Level } from "../game/types";

/**
 * Declarative level content only. No game behaviour lives in this file — the
 * rules that read it are in `src/game/`, so a second level is just another
 * object of this shape.
 */
export const thursdaySocialRun: Level = {
  id: "thursday-social-run",
  title: "Thursday Social Run",
  strapline: "It's totally flat this week.",
  instructions:
    "A gentle loop out from the Observatory and back, with the canal somewhere in the middle of it, and as few pigeons as you can manage.",
  theme: "town",
  startNodeId: "observatory",
  finishNodeId: "observatory",
  // The street furniture and the wildlife, sprinkled where no road runs.
  scatter: [
    { x: 600, y: 220, kind: "lights" },
    { x: 740, y: 240, kind: "car", variant: 1 },
    { x: 240, y: 220, kind: "cat" },
    { x: 340, y: 420, kind: "bin" },
    { x: 420, y: 380, kind: "car", variant: 2 },
    { x: 620, y: 380, kind: "cat" },
    { x: 520, y: 420, kind: "bin" },
  ],

  // One of them, at the water's edge, waiting. Run the group past the pond
  // and it comes with them — the same mechanic as the Fleet Pond goose, and a
  // far worse idea, because this one remembers faces.
  followers: [
    { kind: "goose", nodeId: "geese-pond", dx: -60, dy: 15, scale: 1.3 },
  ],

  /*
   * The built-up bits (#101). The retail park in the top right, which is the
   * Tesco and the houses behind it; the terrace along the bottom; and the
   * Medical Centre, which is the only other thing here with a car park.
   *
   * Everything between them is deliberately still paper: a town map that is
   * grey all over has only swapped one flat colour for another.
   */
  ground: [
    { x: 528, y: 16, width: 252, height: 178 },
    { x: 162, y: 488, width: 462, height: 64 },
    { x: 252, y: 100, width: 152, height: 128 },
  ],

  view: { width: 800, height: 560 },

  // On past the towpath and clean off the western edge, threading the gap
  // between the Observatory and Wellesley Rumble. Canals come from somewhere
  // and go somewhere; this one no longer stops in a field.
  canalTail: [
    { x: 360, y: 250 },
    { x: 250, y: 232 },
    { x: 120, y: 228 },
    { x: -30, y: 210 },
  ],

  objectives: [
    { kind: "start", detail: "Everyone gathers by the telescope, as ever." },
    { kind: "finish", detail: "Route closes the loop." },
    {
      kind: "distance",
      minKm: 5,
      maxKm: 7,
      tooLong: {
        title: "Accidental Long Run",
        message:
          "{km} km on a social Thursday. Three people have gone quiet and one has started talking about a marathon.",
      },
      tooShort: {
        title: "An Innovative Definition of 5K",
        message:
          "{km} km, generously measured. The pace was superb, which is the sort of thing people say about a short run.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["canal-bridge", "towpath"],
      what: "the canal",
      done: "Towpath duly trotted.",
      pending: "Not been anywhere near the water yet.",
      missed: {
        title: "Nobody Visited the Canal",
        message:
          "The route committee are furious. The canal is the entire point of a Thursday. There will be an email.",
      },
      stranded: {
        title: "Nobody Left the Canal",
        message:
          "They reached the towpath, admired a narrowboat called Vitamin Sea, and simply never came back.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "The Closed Road Was, In Fact, Closed",
        message:
          "The barrier was not a suggestion. Fifteen runners are now doing a three-point turn in front of a man with a clipboard.",
      },
    },
    {
      kind: "max-node-type",
      nodeType: "pigeon",
      limit: 1,
      what: "pigeon hotspot",
      fail: {
        title: "Pigeon-Controlled Route",
        message:
          "Two hotspots. Two. The pigeons have taken the front three runners hostage and are negotiating for the flapjacks.",
      },
    },
  ],

  success: {
    title: "Perfect Social Run",
    message:
      "Bang on distance, canal duly admired, and only one pigeon incident. The club WhatsApp will be insufferable about this for a fortnight.",
  },
  emptyRoute: {
    title: "Barely Left the Start Line",
    message:
      "Everyone stood outside the Observatory discussing trainers for forty minutes, then went home.",
  },
  fallback: {
    title: "Everyone Returned Eventually",
    message:
      "Something went awry out there, but the group is back, damp and cheerful, and nobody wants to discuss it.",
  },

  nodes: [
    {
      id: "observatory",
      // Stacked, and out to the left above the telescope rather than centred
      // over the junction: the lane up to Wellesley Rumble leaves almost
      // vertically, so anything centred here is cut in half by it whether it
      // is stacked or not.
      labelSide: "left",
      labelWrap: true,
      labelDy: -34,
      x: 130,
      y: 300,
      label: "The Observatory",
      blurb: "start and finish",
      type: "observatory",
    },
    {
      id: "wellesley-rumble",
      labelAbove: true,
      x: 150,
      y: 175,
      label: "Wellesley Rumble",
      blurb: "nobody agrees what it is, everybody turns up",
    },
    {
      id: "the-hanger",
      x: 455,
      y: 480,
      label: "The Hanger",
      blurb: "pigeon hotspot; they nest in the roof",
      type: "pigeon",
      sprite: "hangar",
    },
    {
      id: "private-bush",
      // To the right, which puts it directly above the bush. Above the
      // junction it was crossed by both the lane to the towpath and the road
      // climbing to the Big Tesco.
      labelSide: "right",
      x: 645,
      y: 445,
      label: "A Private Bush",
      blurb: "nobody saw anything",
      type: "bush",
    },
    {
      id: "canal-bridge",
      x: 700,
      y: 300,
      label: "Canal Bridge",
      blurb: "the canal",
      type: "canal",
    },
    {
      id: "towpath",
      x: 470,
      y: 285,
      label: "Grubby Towpath",
      blurb: "the canal",
      type: "canal",
    },
    {
      id: "geese-pond",
      labelAbove: true,
      x: 300,
      y: 330,
      label: "Vengeful Geese Pond",
      blurb: "they remember faces",
      type: "pond",
    },
    {
      id: "polo-fields",
      x: 110,
      y: 460,
      label: "The Polo Fields",
      blurb: "bins, benches, parkrun on Saturdays",
      type: "park",
    },
    {
      id: "medical-centre",
      labelAbove: true,
      x: 320,
      y: 165,
      label: "Medical Centre Toilet",
      blurb: "a quick pitstop, no questions asked",
      type: "toilet",
    },
    {
      id: "back-passage",
      // Right, not left: the closure barrier sits on the road to its left.
      labelSide: "right",
      x: 285,
      y: 470,
      label: "Up The Back Passage",
      blurb: "a cut-through, and yes, everybody says it",
    },
    {
      id: "hospital-hill",
      // Above: below, the name lay along the lane dropping to the towpath.
      // Nothing at all leaves this junction upwards.
      labelAbove: true,
      x: 495,
      y: 130,
      label: "Hospital Hill",
      blurb: "pigeon hotspot, and a hill about it",
      type: "pigeon",
      sprite: "hill",
      // Up and left of the junction: the lane in from the Medical Centre
      // arrives across where a hill marker usually sits. Nudged further left
      // again to leave room for the name, which now sits above.
      spriteDx: -75,
      spriteDy: -30,
    },
    {
      id: "big-tesco",
      x: 690,
      y: 155,
      label: "The Big Tesco",
      blurb: "the car park is a roundabout with ambitions",
      type: "shop",
    },
  ],

  roads: [
    { id: "obs-rumble", from: "observatory", to: "wellesley-rumble", distanceKm: 0.5 },
    {
      id: "rumble-medical",
      from: "wellesley-rumble",
      to: "medical-centre",
      distanceKm: 0.7,
    },
    {
      id: "hanger-bush",
      from: "the-hanger",
      to: "private-bush",
      distanceKm: 0.8,
      pigeonRisk: 0.6,
    },
    {
      id: "bush-canal",
      from: "private-bush",
      to: "canal-bridge",
      distanceKm: 0.6,
    },
    { id: "canal-tow", from: "canal-bridge", to: "towpath", distanceKm: 1 },
    { id: "bush-tow", from: "private-bush", to: "towpath", distanceKm: 1 },
    { id: "tow-medical", from: "towpath", to: "medical-centre", distanceKm: 0.8 },
    {
      id: "medical-polo",
      from: "medical-centre",
      to: "polo-fields",
      distanceKm: 1.5,
    },
    { id: "polo-obs", from: "polo-fields", to: "observatory", distanceKm: 0.7 },
    { id: "rumble-pond", from: "wellesley-rumble", to: "geese-pond", distanceKm: 0.9 },
    { id: "pond-tow", from: "geese-pond", to: "towpath", distanceKm: 0.7 },
    { id: "pond-polo", from: "geese-pond", to: "polo-fields", distanceKm: 1 },
    {
      id: "hanger-pond",
      from: "the-hanger",
      to: "geese-pond",
      distanceKm: 0.9,
      pigeonRisk: 0.5,
    },
    {
      id: "passage-polo",
      from: "back-passage",
      to: "polo-fields",
      distanceKm: 0.7,
      closed: true,
    },
    { id: "passage-pond", from: "back-passage", to: "geese-pond", distanceKm: 0.6 },
    {
      id: "medical-hospital",
      from: "medical-centre",
      to: "hospital-hill",
      distanceKm: 0.7,
      hill: true,
      pigeonRisk: 0.7,
    },
    {
      id: "hospital-tesco",
      from: "hospital-hill",
      to: "big-tesco",
      distanceKm: 0.8,
      hill: true,
      pigeonRisk: 0.6,
    },
    { id: "tesco-canal", from: "big-tesco", to: "canal-bridge", distanceKm: 0.6 },
    {
      id: "hospital-tow",
      from: "hospital-hill",
      to: "towpath",
      distanceKm: 0.7,
      pigeonRisk: 0.4,
    },
    { id: "bush-tesco", from: "private-bush", to: "big-tesco", distanceKm: 1.2 },
  ],
};
