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
    "Plan a loop from the Observatory and back. Tap or click a junction joined to the end of your route to add a road; tap the junction you just came from to undo it.",
  theme: "town",
  startNodeId: "observatory",
  finishNodeId: "observatory",
  view: { width: 800, height: 560 },

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
    {
      kind: "no-repeat",
      fail: {
        title: "Everyone Returned Eventually",
        message:
          "You sent the group up and down the same stretch until somebody\u2019s watch gave up and somebody else pretended to have a hamstring.",
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
      labelAbove: true,
      x: 110,
      y: 460,
      label: "The Observatory",
      blurb: "start and finish",
      type: "observatory",
    },
    {
      id: "high-street",
      labelAbove: true,
      x: 285,
      y: 470,
      label: "High Street",
      blurb: "three charity shops and a vape emporium",
    },
    {
      id: "pigeon-square",
      labelAbove: true,
      x: 455,
      y: 480,
      label: "Pigeon Square",
      blurb: "pigeon hotspot",
      type: "pigeon",
    },
    {
      id: "private-bush",
      labelAbove: true,
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
      id: "gardens",
      x: 130,
      y: 300,
      label: "Municipal Gardens",
      blurb: "bins, benches, bunting",
      type: "park",
    },
    {
      id: "hill-top",
      labelAbove: true,
      x: 320,
      y: 165,
      label: "The Slightly Unnecessary Hill",
      blurb: "nobody has ever asked for this",
      type: "hill",
    },
    {
      id: "shortcut",
      x: 150,
      y: 175,
      label: "Shortcut of Questionable Legality",
      blurb: "a gate, a sign, a decision",
    },
    {
      id: "bandstand",
      x: 495,
      y: 130,
      label: "The Bandstand",
      blurb: "pigeon hotspot",
      type: "pigeon",
    },
    {
      id: "depot",
      x: 690,
      y: 155,
      label: "Bin Lorry Depot",
      blurb: "smells of Tuesday",
      type: "depot",
    },
  ],

  roads: [
    { id: "obs-high", from: "observatory", to: "high-street", distanceKm: 0.7 },
    {
      id: "high-pigeon",
      from: "high-street",
      to: "pigeon-square",
      distanceKm: 0.6,
      pigeonRisk: 0.8,
    },
    {
      id: "pigeon-bush",
      from: "pigeon-square",
      to: "private-bush",
      distanceKm: 0.8,
      pigeonRisk: 0.6,
    },
    {
      id: "bush-canal",
      from: "private-bush",
      to: "canal-bridge",
      distanceKm: 0.7,
    },
    { id: "canal-tow", from: "canal-bridge", to: "towpath", distanceKm: 0.9 },
    { id: "tow-hill", from: "towpath", to: "hill-top", distanceKm: 0.8, hill: true },
    {
      id: "hill-gardens",
      from: "hill-top",
      to: "gardens",
      distanceKm: 0.9,
      hill: true,
    },
    { id: "gardens-obs", from: "gardens", to: "observatory", distanceKm: 0.8 },
    { id: "high-pond", from: "high-street", to: "geese-pond", distanceKm: 0.65 },
    { id: "pond-tow", from: "geese-pond", to: "towpath", distanceKm: 0.85 },
    { id: "pond-gardens", from: "geese-pond", to: "gardens", distanceKm: 0.75 },
    {
      id: "pigeon-pond",
      from: "pigeon-square",
      to: "geese-pond",
      distanceKm: 0.7,
      pigeonRisk: 0.5,
    },
    { id: "hill-short", from: "hill-top", to: "shortcut", distanceKm: 0.6, hill: true },
    {
      id: "short-gardens",
      from: "shortcut",
      to: "gardens",
      distanceKm: 0.5,
      closed: true,
    },
    { id: "short-pond", from: "shortcut", to: "geese-pond", distanceKm: 0.8 },
    {
      id: "hill-band",
      from: "hill-top",
      to: "bandstand",
      distanceKm: 1,
      pigeonRisk: 0.7,
    },
    {
      id: "band-depot",
      from: "bandstand",
      to: "depot",
      distanceKm: 0.8,
      pigeonRisk: 0.6,
    },
    { id: "depot-canal", from: "depot", to: "canal-bridge", distanceKm: 0.9 },
    {
      id: "band-tow",
      from: "bandstand",
      to: "towpath",
      distanceKm: 0.7,
      pigeonRisk: 0.4,
    },
    { id: "bush-depot", from: "private-bush", to: "depot", distanceKm: 1.1 },
  ],
};
