import type { Level } from "../game/types";

/**
 * The Farnborough Winter Half Marathon, which is a real race on a real Sunday
 * in February, and the first level on the roster that is not a club run.
 *
 * That is the whole design. Everywhere else the club picks a route and argues
 * about it; here somebody else has already measured one and put cones on it.
 * The course is a single anti-clockwise lap of Farnborough Airport and Cody
 * Technology Park, starting and finishing under the airship hangars at
 * Farnborough Business Park, and it is 21.1 km because that is what a half
 * marathon is.
 *
 * So the map is a ring with a town on top of it. The perimeter is the course.
 * The streets across the north — the station, Cove Green, Southwood — are
 * every shorter way round, and every one of them comes home under the
 * distance. The brief is 21.0 to 21.3 rather than a comfortable window on
 * purpose: a race is measured, and a route that is half a kilometre out is not
 * a slightly different race, it is a wrong one.
 *
 * `mood: "frost"` because it is the Winter Half and it is February, which is
 * the Christmas Run's treatment used on a level that is not Christmas — a
 * deliberate widening, because frost is weather and February in Hampshire has
 * it. It gets its own `music` for the same reason: the house theme is a
 * Thursday evening and this is a start pen. `flock` stays unset; the birds are
 * pigeons like anywhere else.
 *
 * Every name is real: Elles Road and Ively Road round the airfield, Cody
 * Technology Park and Ball Hill to the west, Pyestock Wood and Miles Hill in
 * the south-west, the Farnborough Aerospace Centre, and Danger Hill and
 * Cockadobby Hill, which are both genuinely called that.
 */
export const farnboroughHalf: Level = {
  id: "farnborough-half",
  title: "Farnborough Winter Half",
  strapline: "Thirteen point one. In February.",
  instructions:
    "One lap of the airfield, anti-clockwise, from under the airship hangars. It is measured and it is chip-timed, so the shortcuts through town are somebody else's morning.",
  theme: "town",
  mood: "frost",
  music: "race-theme.mp3",
  startNodeId: "airship-hangars",
  finishNodeId: "airship-hangars",
  view: { width: 800, height: 560 },

  objectives: [
    {
      kind: "start",
      detail: "Under the arch, in a bin bag, at half past eight.",
    },
    { kind: "finish", detail: "Back under the arch, for the medal." },
    {
      kind: "distance",
      minKm: 21,
      maxKm: 21.3,
      tooLong: {
        title: "Your Watch Will Say Otherwise",
        message:
          "{km} km. Every watch in the field disagrees with every other watch in the field, but none of them by this much. You have run a lap and a bit.",
      },
      tooShort: {
        title: "That Was Not The Course",
        message:
          "{km} km. You have cut a corner somewhere between here and the airfield, and there is a timing mat that knows exactly which one.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["cody-park"],
      what: "Cody Technology Park",
      reportLabel: "Cody rounded",
      done: "Out round the technology park, as the course says.",
      pending: "The course goes round Cody. You have not been.",
      missed: {
        title: "Half A Lap Of An Airfield",
        message:
          "The course goes round Cody Technology Park and you have gone round something else. This is a measured race, not a tour of Farnborough.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["aerospace-centre"],
      what: "the Aerospace Centre",
      reportLabel: "Aerospace Centre passed",
      done: "Down the south side, past the Aerospace Centre.",
      pending: "The south side of the airfield is still to come.",
      missed: {
        title: "You Missed The Whole South Side",
        message:
          "Twelve marshals, a water station and a man with a megaphone, and the group went nowhere near any of them.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "Coned Off, And You Know Why",
        message:
          "That one is coned off because it is not the course. A marshal in a high-vis tabard watched nine people run past her and has written the number down.",
      },
    },
  ],

  success: {
    title: "Thirteen Point One",
    message:
      "{km} km, one lap of the airfield, and a medal roughly the size of a beer mat. It is already on Strava with a photograph of the medal.",
  },
  emptyRoute: {
    title: "Still In The Bag Queue",
    message:
      "The gun went twenty minutes ago and the group is still discussing whether to run in the long sleeves. The long sleeves were a mistake either way.",
  },
  fallback: {
    title: "A Half Of Something",
    message:
      "{km} km of Farnborough. The results will be along in a fortnight and nobody is looking forward to them.",
  },

  nodes: [
    {
      id: "airship-hangars",
      x: 655,
      y: 175,
      label: "The Airship Hangars",
      blurb: "start and finish, and the arch everybody photographs",
      type: "hangar",
      labelSide: "right",
      // Left of the junction: three roads leave it and the sheds sat on the
      // one heading south to Cockadobby Hill.
      spriteDx: -50,
      spriteDy: -50,
    },
    {
      id: "farnborough-main",
      x: 700,
      y: 118,
      label: "Farnborough Main",
      blurb: "where half the field arrived, late",
      type: "railway",
      labelAbove: true,
      // Lifted clear of its own name, which is above it.
      spriteDy: -60,
    },
    {
      id: "cove-green",
      x: 535,
      y: 95,
      label: "Cove Green",
      blurb: "a green, and a shortcut you are not taking",
      type: "park",
      labelAbove: true,
    },
    {
      id: "southwood",
      x: 300,
      y: 105,
      label: "Southwood",
      blurb: "woodland, and a golf course nobody is playing",
      type: "woods",
      labelAbove: true,
      // Same again: the name is above, so the trees go above the name.
      spriteDy: -60,
    },
    {
      id: "elles-road",
      x: 455,
      y: 190,
      label: "Elles Road",
      blurb: "the top of the airfield, and the first kilometre",
      labelAbove: true,
    },
    {
      id: "ively-road",
      x: 295,
      y: 240,
      label: "Ively Road",
      blurb: "long, straight, and into the wind every year",
    },
    {
      id: "cody-park",
      x: 150,
      y: 325,
      label: "Cody Tech Park",
      blurb: "where they test the things that go bang",
      labelSide: "left",
    },
    {
      id: "pyestock-wood",
      x: 105,
      y: 448,
      label: "Pyestock Wood",
      blurb: "the quietest kilometre of the whole race",
      type: "woods",
      labelSide: "right",
      // Up rather than left. A nudge sideways cleared the lane from Cody by
      // the twenty units the test asks for and by nothing at all by eye: a
      // wood is several trees wide.
      spriteDx: -20,
      spriteDy: -55,
    },
    {
      id: "miles-hill",
      x: 255,
      y: 480,
      label: "Miles Hill",
      blurb: "advertised as flat, and it is not",
      type: "hill",
      // Further out and down: the course runs through where a hill marker
      // usually sits on both sides of this junction.
      spriteDx: -50,
      spriteDy: 10,
    },
    {
      id: "aerospace-centre",
      x: 450,
      y: 455,
      label: "Aerospace Centre",
      blurb: "water station, jelly babies, a man with a megaphone",
      type: "airport",
      labelAbove: true,
      // Further out into the middle of the airfield, which is where an
      // aeroplane belongs anyway. At -70 the anchor cleared the name by four
      // units and the drawing — which is forty-eight across — did not.
      spriteDx: -90,
      spriteDy: -20,
    },
    {
      id: "danger-hill",
      x: 585,
      y: 470,
      label: "Danger Hill",
      blurb: "genuinely called that, at nineteen kilometres",
      type: "hill",
      spriteDx: -55,
      spriteDy: 15,
    },
    {
      id: "cockadobby-hill",
      x: 705,
      y: 375,
      label: "Cockadobby Hill",
      blurb: "also genuinely called that, and the last climb",
      type: "hill",
      labelSide: "left",
      // Up rather than beside: the name is on the left and the road home to
      // the hangars leaves through the marker's usual spot.
      spriteDx: -45,
      spriteDy: -25,
    },
  ],

  roads: [
    /*
     * The course, anti-clockwise from the arch. Nine roads and 21.1 km between
     * them, which is not a coincidence — it is the whole level. Change one of
     * these and the race stops being a half marathon.
     *
     * The first leg is the long one because the course goes round the east end
     * of the airfield before it turns west along the top, which is also what
     * makes the way through town a real alternative rather than a detour.
     */
    {
      id: "hangars-elles",
      from: "airship-hangars",
      to: "elles-road",
      distanceKm: 4.4,
    },
    { id: "elles-ively", from: "elles-road", to: "ively-road", distanceKm: 2.4 },
    { id: "ively-cody", from: "ively-road", to: "cody-park", distanceKm: 1.8 },
    {
      id: "cody-pyestock",
      from: "cody-park",
      to: "pyestock-wood",
      distanceKm: 1.9,
    },
    {
      id: "pyestock-miles",
      from: "pyestock-wood",
      to: "miles-hill",
      distanceKm: 2.1,
      hill: true,
    },
    {
      id: "miles-aerospace",
      from: "miles-hill",
      to: "aerospace-centre",
      distanceKm: 2.3,
    },
    {
      id: "aerospace-danger",
      from: "aerospace-centre",
      to: "danger-hill",
      distanceKm: 1.8,
      hill: true,
    },
    {
      id: "danger-cockadobby",
      from: "danger-hill",
      to: "cockadobby-hill",
      distanceKm: 2,
      hill: true,
    },
    {
      id: "cockadobby-hangars",
      from: "cockadobby-hill",
      to: "airship-hangars",
      distanceKm: 2.4,
    },

    /*
     * The two legal ways of not going the obvious way, and the reason this map
     * is worth planning rather than tracing.
     *
     * Through the station and Cove Green comes to 4.4 km, which is exactly what
     * the top of the airfield comes to. Round Southwood comes to 2.4 km, which
     * is exactly what Elles Road to Ively Road comes to. Neither is a shortcut
     * and neither is a detour — they are the same race, measured, which is what
     * having a course measured actually buys you.
     */
    {
      id: "hangars-main",
      from: "airship-hangars",
      to: "farnborough-main",
      distanceKm: 1.3,
    },
    {
      id: "main-cove",
      from: "farnborough-main",
      to: "cove-green",
      distanceKm: 1.4,
    },
    { id: "cove-elles", from: "cove-green", to: "elles-road", distanceKm: 1.7 },
    {
      id: "southwood-elles",
      from: "southwood",
      to: "elles-road",
      distanceKm: 1.5,
    },
    {
      id: "southwood-ively",
      from: "southwood",
      to: "ively-road",
      distanceKm: 0.9,
    },

    // Cove Green to Southwood, which joins the two alternatives together and
    // is the wrong length for both of them.
    {
      id: "cove-southwood",
      from: "cove-green",
      to: "southwood",
      distanceKm: 1.6,
    },

    /*
     * Three closures, and the only ones on the roster shut *for* a race rather
     * than in spite of one. Two cut a corner off the airfield and the third is
     * the obvious way from the station back onto the top of it, which is
     * precisely why there is a marshal standing on each.
     *
     * They are coned off rather than merely long because of what happened when
     * they were not. A corner cut is short and a lap of the town is long, so
     * the two cancel: an early draft had four winners and three of them cut a
     * corner and then made the distance back up through Cove Green.
     * Arithmetically fine, and entirely against the point of a measured
     * course. Closing them is also what happens on the day.
     */
    {
      id: "cody-miles",
      from: "cody-park",
      to: "miles-hill",
      distanceKm: 3,
      closed: true,
    },
    {
      id: "aerospace-cockadobby",
      from: "aerospace-centre",
      to: "cockadobby-hill",
      distanceKm: 3.6,
      closed: true,
    },
    {
      id: "main-elles",
      from: "farnborough-main",
      to: "elles-road",
      distanceKm: 2.2,
      closed: true,
    },
  ],

  // Farnborough in February: the airfield apron, the business park round the
  // hangars, and the technology park out west.
  ground: [
    { x: 300, y: 250, width: 290, height: 170 },
    { x: 606, y: 130, width: 168, height: 100 },
    { x: 60, y: 286, width: 140, height: 118 },
  ],

  /*
   * The furniture that makes it a race rather than a Sunday: the start line by
   * the arch where the gun goes, and the supporters at the kerb round the lap
   * — close enough to the road to be watching it rather than standing in a
   * field near it.
   *
   * And penguins, which are not native to Farnborough and are not going to
   * explain themselves. There is one in every February field.
   */
  scatter: [
    { x: 620, y: 220, kind: "startline" },

    /*
     * Kerbside: the anchor within reach of a road so they read as watching the
     * race, and every corner of the drawing standing off the tarmac.
     *
     * That second half is the bit worth writing down. The scenery test asks
     * for fourteen units from the anchor, and this sprite runs to twenty-six
     * on its right — so two of these passed it while sitting squarely under
     * the road. The Cove Green pair were also behind one of the trees a `park`
     * junction scatters round itself, which nothing checks at all.
     */
    { x: 225, y: 255, kind: "supporters" },
    { x: 390, y: 485, kind: "supporters" },
    { x: 640, y: 290, kind: "supporters" },
    { x: 445, y: 75, kind: "supporters" },

    /*
     * The mascot, so two of them stand at the kerb with the supporters and the
     * other two are off doing whatever a penguin does at a road race.
     */
    { x: 115, y: 355, kind: "penguin" },
    { x: 540, y: 445, kind: "penguin" },
    { x: 340, y: 340, kind: "penguin" },
    { x: 722, y: 300, kind: "penguin" },

    { x: 388, y: 128, kind: "car", variant: 1 },
    { x: 760, y: 250, kind: "cat" },
    { x: 60, y: 100, kind: "tree" },
    { x: 170, y: 105, kind: "tree" },
    { x: 60, y: 500, kind: "bench" },
  ],
};
