import type { Level } from "../game/types";

/**
 * Crooksbury, and the first map that is about the climbing rather than about
 * where the climbing happens to be.
 *
 * The hills are real and so is the arrangement. Crooksbury Hill is 162 m with
 * a trig point on top, the 21st highest hill in Surrey, and on a clear day you
 * can see Hindhead and Gibbet Hill from it. Soldier's Ring is the earthwork on
 * its own hillside. Hillbury is an Iron Age hillfort on Puttenham Common,
 * above Cutmill Pond, and a scheduled monument. Botany Hill is the high ground
 * over The Sands. The Hog's Back is the North Downs ridge between Farnham and
 * Guildford, with Seale at the foot of the scarp. General's Pond was dug by
 * hand, probably to feed Puttenham Priory, and Cutmill Pond — the Tarn — is an
 * estate lake in the woods below it. Farnham Golf Club really is at The Sands
 * and The Good Intent really is in Puttenham.
 *
 * The design problem is the interesting one, and it is not the geography.
 *
 * `paceOf` drops the group to 55% of its speed on a road marked `hill`, but
 * the run always takes the same eight seconds, so a climb costs the flat legs
 * their time rather than making the run longer. Mark *every* road as a hill
 * and `totalCost` scales by the same factor everywhere, `fractionAt(effort)`
 * collapses back to `effort`, and the level animates exactly like a flat one.
 * A map where everything is a hill has no hills at all. So eleven of the
 * nineteen roads climb and eight do not, and the eight are what make the
 * eleven mean something — which is also true of the actual place, where the
 * lanes along the bottom are the only flat ground for miles.
 *
 * Hence `kind: "climb"`, which is new here. Every other objective in the game
 * forbids something or asks you to be somewhere; this one asks for the work
 * itself, and it counts roads rather than summits so that strolling up the
 * lane to a hilltop does not satisfy it. The incident report's "Unnecessary
 * hills" line reads as "Hills climbed" on any level that declares it: the
 * quantity is identical and the joke is inverted, which is the whole point of
 * driving to Crooksbury on a Sunday.
 *
 * Daylight, the house theme, and no flock of its own — nothing here is a
 * season or an occasion.
 */
export const crooksburyHill: Level = {
  id: "crooksbury-hill",
  title: "Crooksbury Hill",
  strapline: "It is uphill. In every direction.",
  instructions:
    "Out from the common over Crooksbury Hill, round under the Hog's Back and home across Hillbury. Seven climbs, and the flat bits are a rumour.",
  theme: "trail",
  startNodeId: "puttenham-common",
  finishNodeId: "puttenham-common",
  view: { width: 800, height: 560 },

  nodes: [
    {
      id: "puttenham-common",
      x: 560,
      y: 250,
      label: "Puttenham Common",
      blurb: "the top car park, and the only flat ground all day",
      type: "carpark",
      labelAbove: true,
      // Down and left, into the one corner of this junction that has neither a
      // road nor its own name in it.
      spriteDx: -60,
      spriteDy: 30,
    },
    {
      id: "puttenham",
      x: 600,
      y: 105,
      label: "Puttenham",
      blurb: "a village, and The Good Intent, which is shut",
      type: "pub",
      labelSide: "right",
      // Left of the junction: the default hangs it sixty above, which is where
      // the theme has already put a tree.
      spriteDx: -60,
      spriteDy: -45,
    },
    {
      id: "hogs-back",
      x: 300,
      y: 70,
      label: "The Hog's Back",
      blurb: "the North Downs, and the whole of Surrey behind you",
      type: "hill",
      // Above rather than beside. To the left is Seale's church and a tree the
      // theme scatters, and the anchors clear each other by forty-seven while
      // the drawings do not (#110).
      spriteDx: 0,
      spriteDy: -40,
    },
    {
      id: "seale",
      x: 215,
      y: 150,
      label: "Seale",
      blurb: "St Laurence, at the foot of the scarp",
      type: "church",
      labelSide: "left",
      // And the church left, for the other half of the same clash.
      spriteDx: -30,
      spriteDy: -52,
    },
    {
      id: "the-sands",
      x: 100,
      y: 245,
      label: "The Sands",
      blurb: "a green, a bowling club, and Farnham Golf Club",
      type: "golf",
      labelSide: "right",
      // Below the junction rather than up and left, which is a tree.
      spriteDx: -45,
      spriteDy: 45,
    },
    {
      id: "botany-hill",
      x: 215,
      y: 285,
      label: "Botany Hill",
      blurb: "the high ground over The Sands",
      type: "hill",
    },
    {
      id: "crooksbury-hill",
      x: 250,
      y: 430,
      label: "Crooksbury Hill",
      blurb: "162 m, a trig point, and Hindhead from the top",
      type: "hill",
      // Further out than the usual forty-four: four roads meet here and the
      // default lands the marker on the one up to The Sands.
      spriteDx: -65,
      spriteDy: -20,
    },
    {
      id: "soldiers-ring",
      x: 140,
      y: 470,
      label: "Soldier's Ring",
      blurb: "earthworks, and nobody is sure whose",
      type: "hill",
      labelAbove: true,
    },
    {
      id: "hampton-estate",
      x: 420,
      y: 205,
      label: "Hampton Estate",
      blurb: "hop fields, and the common's landlord",
      type: "manor",
    },
    {
      id: "hillbury",
      x: 470,
      y: 350,
      label: "Hillbury",
      blurb: "an Iron Age hillfort, and a scheduled monument",
      type: "hill",
      labelSide: "left",
      // Up and left, clear of both the estate track and its own name.
      spriteDx: -60,
      spriteDy: -30,
    },
    {
      id: "generals-pond",
      x: 640,
      y: 375,
      label: "General's Pond",
      blurb: "dug by hand, to feed Puttenham Priory",
      type: "pond",
    },
    {
      id: "cutmill-pond",
      x: 555,
      y: 480,
      label: "Cutmill Pond",
      blurb: "the Tarn, and an estate lake in the trees",
      type: "pond",
      labelAbove: true,
    },
  ],

  /*
   * Eleven of these climb and eight do not. The flat eight are the lanes and
   * the valley floor — the pond chain, the road along under the scarp, the
   * track across the common — and they are load-bearing: see the note at the
   * top for why a map of nothing but hills is a map of no hills.
   *
   * `hill` here means steep rather than uphill. A route is a set of roads and
   * has no direction, so a road cannot be a climb one way and a descent the
   * other; the scarp off the Hog's Back costs you either way, and anyone who
   * has run down it will not argue.
   */
  roads: [
    { id: "common-puttenham", from: "puttenham-common", to: "puttenham", distanceKm: 1.3 },
    { id: "common-hampton", from: "puttenham-common", to: "hampton-estate", distanceKm: 1.2 },
    /*
     * The estate track up onto the common, and the road that keeps the two
     * waypoints honest. Without it every route that reaches Hillbury is forced
     * on to Crooksbury — the hillfort's only other neighbours are the two
     * ponds, and both of them lead back the way you came — so the two
     * objectives could never fail apart, and two rules that cannot disagree
     * are one rule with two ticks. Frensham learned this the same way.
     */
    { id: "hampton-hillbury", from: "hampton-estate", to: "hillbury", distanceKm: 1.6, hill: true },
    { id: "generals-common", from: "generals-pond", to: "puttenham-common", distanceKm: 1.4 },
    { id: "puttenham-hogsback", from: "puttenham", to: "hogs-back", distanceKm: 1.5, hill: true },
    { id: "hampton-hogsback", from: "hampton-estate", to: "hogs-back", distanceKm: 2.0, hill: true },
    { id: "hogsback-seale", from: "hogs-back", to: "seale", distanceKm: 1.7, hill: true },
    { id: "hampton-seale", from: "hampton-estate", to: "seale", distanceKm: 2.2 },
    { id: "seale-sands", from: "seale", to: "the-sands", distanceKm: 1.2 },
    { id: "botany-seale", from: "botany-hill", to: "seale", distanceKm: 1.4, hill: true },
    { id: "sands-botany", from: "the-sands", to: "botany-hill", distanceKm: 0.9, hill: true },
    { id: "sands-crooksbury", from: "the-sands", to: "crooksbury-hill", distanceKm: 1.8, hill: true },
    { id: "botany-crooksbury", from: "botany-hill", to: "crooksbury-hill", distanceKm: 1.9, hill: true },
    { id: "crooksbury-soldiers", from: "crooksbury-hill", to: "soldiers-ring", distanceKm: 0.7, hill: true },
    { id: "crooksbury-hillbury", from: "crooksbury-hill", to: "hillbury", distanceKm: 2.2, hill: true },
    { id: "soldiers-cutmill", from: "soldiers-ring", to: "cutmill-pond", distanceKm: 1.8 },
    { id: "hillbury-cutmill", from: "hillbury", to: "cutmill-pond", distanceKm: 1.0, hill: true },
    { id: "hillbury-generals", from: "hillbury", to: "generals-pond", distanceKm: 1.1, hill: true },
    { id: "generals-cutmill", from: "generals-pond", to: "cutmill-pond", distanceKm: 0.9 },
  ],

  /* Hardstanding, which on a heath is the car park and nothing else. */
  ground: [{ x: 496, y: 208, width: 128, height: 84, rx: 12 }],

  // Heath: gorse, sandstone, and two plastic soldiers at the Ring, which is
  // not what the earthwork was named for and is the closest anyone has got.
  scatter: [
    { x: 100, y: 45, kind: "gorse" },
    { x: 440, y: 40, kind: "gorse" },
    { x: 640, y: 240, kind: "gorse" },
    { x: 660, y: 460, kind: "gorse" },
    { x: 700, y: 45, kind: "rock" },
    { x: 60, y: 360, kind: "rock" },
    { x: 360, y: 40, kind: "signpost" },
    { x: 60, y: 500, kind: "soldier", variant: 2 },
    { x: 135, y: 505, kind: "soldier", variant: 4, flip: true },
    { x: 300, y: 500, kind: "bench" },
    { x: 740, y: 340, kind: "dog" },
  ],

  objectives: [
    { kind: "start", detail: "In the top car park, off Suffield Lane." },
    { kind: "finish", detail: "Back at the cars, on the flat, at last." },
    {
      kind: "distance",
      minKm: 12,
      maxKm: 14,
      tooLong: {
        title: "An Innovative Reading Of The Map",
        message:
          "{km} km. Somebody has added a hill that was not on the list and is describing it as a loop.",
      },
      tooShort: {
        title: "That Was The Car Park And A Lane",
        message:
          "{km} km. Everybody drove forty minutes to run round the bottom of a hill.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["crooksbury-hill"],
      what: "Crooksbury Hill",
      reportLabel: "Trig point touched",
      done: "Up Crooksbury. Hindhead from the top, on a good day.",
      pending: "The trig point is still up there.",
      missed: {
        title: "The Hill It Is Named After",
        message:
          "A run to Crooksbury that went round Crooksbury. The trig point is 162 m up and it is not going to come down.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["hillbury"],
      what: "Hillbury",
      reportLabel: "Hillfort taken",
      done: "Over the hillfort. Two thousand years old, and still steep.",
      pending: "Hillbury is still to come, above Cutmill.",
      missed: {
        title: "The Iron Age Went Unvisited",
        message:
          "Hillbury has stood there for two thousand years and the club could not make the detour.",
      },
    },
    {
      kind: "climb",
      minHills: 7,
      fail: {
        title: "You Found The Flat Way Round",
        message:
          "Somebody has picked a route through Crooksbury that avoids the climbing. It is a remarkable piece of work and it is not the run.",
      },
    },
  ],

  success: {
    title: "Everything Was Uphill",
    message:
      "{km} km, seven climbs, the trig point and the hillfort. Nobody is talking. Somebody is lying on the grass.",
  },
  emptyRoute: {
    title: "Still In The Car Park",
    message: "Everyone is looking at the hill and nobody is moving.",
  },
  fallback: {
    title: "Some Of It Was Uphill",
    message: "{km} km, and the committee has questions about the rest.",
  },
};
