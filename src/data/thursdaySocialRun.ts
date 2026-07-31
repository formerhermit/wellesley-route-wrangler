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
      id: "squirrel-pub",
      labelAbove: true,
      x: 285,
      y: 470,
      label: "The Squirrel Pub",
      blurb: "not the finish, whatever anybody tells you",
      type: "pub",
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
      id: "redan-road",
      labelAbove: true,
      x: 320,
      y: 165,
      label: "Redan Road",
      blurb: "stupid, massive, and entirely on purpose",
      type: "hill",
    },
    {
      id: "back-passage",
      x: 150,
      y: 175,
      label: "The Back Passage",
      blurb: "a cut-through, and yes, everyone says it",
    },
    {
      id: "wellington-statue",
      x: 190,
      y: 100,
      label: "Wellington Statue",
      blurb: "nobody is looking at the horse. everybody is looking at the horse",
      type: "statue",
      labelAbove: true,
    },
    {
      id: "polo-field",
      x: 495,
      y: 130,
      label: "Polo Field",
      blurb: "pigeon hotspot; parkrun on Saturdays",
      type: "pigeon",
    },
    {
      id: "hangar",
      x: 690,
      y: 155,
      label: "The Hangar",
      blurb: "round the back of the airport",
      type: "hangar",
    },
  ],

  roads: [
    { id: "obs-pub", from: "observatory", to: "squirrel-pub", distanceKm: 0.7 },
    {
      id: "pub-pigeon",
      from: "squirrel-pub",
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
    { id: "tow-redan", from: "towpath", to: "redan-road", distanceKm: 0.8, hill: true },
    {
      id: "redan-gardens",
      from: "redan-road",
      to: "gardens",
      distanceKm: 0.9,
      hill: true,
    },
    { id: "gardens-obs", from: "gardens", to: "observatory", distanceKm: 0.8 },
    { id: "pub-pond", from: "squirrel-pub", to: "geese-pond", distanceKm: 0.65 },
    { id: "pond-tow", from: "geese-pond", to: "towpath", distanceKm: 0.85 },
    { id: "pond-gardens", from: "geese-pond", to: "gardens", distanceKm: 0.75 },
    {
      id: "pigeon-pond",
      from: "pigeon-square",
      to: "geese-pond",
      distanceKm: 0.7,
      pigeonRisk: 0.5,
    },
    { id: "redan-passage", from: "redan-road", to: "back-passage", distanceKm: 0.6, hill: true },
    {
      id: "passage-gardens",
      from: "back-passage",
      to: "gardens",
      distanceKm: 0.5,
      closed: true,
    },
    { id: "passage-pond", from: "back-passage", to: "geese-pond", distanceKm: 0.8 },
    {
      id: "passage-statue",
      from: "back-passage",
      to: "wellington-statue",
      distanceKm: 0.6,
    },
    {
      id: "statue-redan",
      from: "wellington-statue",
      to: "redan-road",
      distanceKm: 0.9,
    },
    {
      id: "redan-polo",
      from: "redan-road",
      to: "polo-field",
      distanceKm: 1,
      pigeonRisk: 0.7,
    },
    {
      id: "polo-hangar",
      from: "polo-field",
      to: "hangar",
      distanceKm: 0.8,
      pigeonRisk: 0.6,
    },
    { id: "hangar-canal", from: "hangar", to: "canal-bridge", distanceKm: 0.9 },
    {
      id: "polo-tow",
      from: "polo-field",
      to: "towpath",
      distanceKm: 0.7,
      pigeonRisk: 0.4,
    },
    { id: "bush-hangar", from: "private-bush", to: "hangar", distanceKm: 1.1 },
  ],
};
