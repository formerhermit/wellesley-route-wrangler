import type { Level } from "../game/types";

/**
 * The third Thursday on the roster, and the one that leaves town altogether:
 * out of the garrison and onto the Aldershot military training area.
 *
 * The geography is real and so are the names. Out from the Duke of Wellington
 * on Round Hill, up Claycart Road past Aldershot Raceway — stock cars and
 * bangers, on the flat at Claycart Bottom — north by Rushmoor Arena and Wharf
 * Copse, round Puckridge Hill and its car park, and home across Laffan's
 * Plain, Eelmoor Plain, Long Valley and the pines of Jubilee Plantation. All
 * of it is army land, which is why a red flag matters and why nobody out here
 * is surprised by soldiers.
 *
 * Daylight, pigeons and the house theme, exactly as levels 1, 3 and 5 are: no
 * `mood`, no `flock`, no `music`. Those three fields between them are the
 * Halloween and Christmas kit, and a Thursday is not an occasion.
 * `nightLevel.test.ts` holds it to that, because an early draft went out at
 * dusk with crows and simply read as a second Spooky Run.
 *
 * `theme: "trail"` because the ground is heath, sand and plantation. The town
 * theme would run terraces along the edge of Long Valley.
 *
 * The Basingstoke Canal is genuinely up there, under the road at Wharf Copse,
 * and is not drawn. A canal enters from the right-hand edge at a fixed height
 * and has to be given somewhere to go; on this map the only corridor heading
 * the right way is already occupied by the road from Puckridge Hill, and water
 * running parallel to a road a dozen units away reads as a second road. Better
 * absent than wrong.
 */
export const thursdayNightRun: Level = {
  id: "thursday-night-run",
  title: "Thursday Night Run",
  strapline: "Mind the flags.",
  instructions:
    "Out from the Duke and up Claycart Road past the banger track, round by Puckridge and home through the plantation. It is army land, and the army has opinions about where you run.",
  theme: "trail",
  startNodeId: "wellington-statue",
  finishNodeId: "wellington-statue",
  view: { width: 800, height: 560 },

  /*
   * Somebody's dog, off the lead on the training area, which is against about
   * four different bits of the byelaws. It falls in at the car park and comes
   * the rest of the way round.
   */
  followers: [{ kind: "dog", nodeId: "puckridge-car-park", dx: 62, dy: -18 }],

  objectives: [
    { kind: "start", detail: "Everyone gathers under the horse, as ever." },
    { kind: "finish", detail: "Route closes the loop." },
    {
      kind: "distance",
      minKm: 8.5,
      maxKm: 11,
      tooLong: {
        title: "Accidental Recce",
        message:
          "{km} km of army land on a Thursday. Two people have run out of water and one has begun asking whether the Raceway does teas.",
      },
      tooShort: {
        title: "Barely Off The Tarmac",
        message:
          "{km} km. The group got as far as the training area, had a look at it, and came home. Nobody's shoes need washing.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["banger-track"],
      what: "the Banger Track",
      reportLabel: "Bangers inspected",
      done: "Past the track. Gates shut, nothing racing, everyone disappointed.",
      pending: "Nowhere near the banger track yet.",
      missed: {
        title: "You Missed The Bangers",
        message:
          "A run round Claycart that never went past the stock car track. That is the one thing out here anybody actually wanted to look at.",
      },
    },
    {
      kind: "visit",
      nodeIds: ["puckridge-car-park"],
      what: "Puckridge Car Park",
      reportLabel: "Puckridge reached",
      done: "Round the car park, past the one car nobody can account for.",
      pending: "Puckridge is still a long way off.",
      missed: {
        title: "Puckridge Went Unvisited",
        message:
          "The whole point of coming up here was the turn at Puckridge. You have instead run a small circle near the road for no reason at all.",
      },
      stranded: {
        title: "Nobody Left The Car Park",
        message:
          "The group has stopped at Puckridge and is standing in a ring looking at a map on somebody's phone. The phone is at four per cent.",
      },
    },
    {
      kind: "max-node-type",
      nodeType: "pigeon",
      limit: 1,
      what: "pigeon hotspot",
      fail: {
        title: "The Whole Heath Went Up",
        message:
          "Two hotspots. The Arena flock met the Laffan's Plain flock somewhere over Claycart Bottom, and the group ran the last two kilometres without speaking.",
      },
    },
    {
      kind: "avoid-closed",
      fail: {
        title: "The Flags Were Up",
        message:
          "Red flags on the Long Valley crossing, which on a range means live firing and on a Thursday means turn round. The warden has taken the club's name and is writing it down slowly.",
      },
    },
  ],

  success: {
    title: "A Proper Thursday",
    message:
      "{km} km round the training area, the bangers, Puckridge, and only the one lot of pigeons. Everybody is back and only one person fell over.",
  },
  emptyRoute: {
    title: "Nobody Left The Duke",
    message:
      "The group stood under the statue arguing about whether the flags were up until it was too late to go anywhere, and then went to the pub.",
  },
  fallback: {
    title: "Something Happened Out There",
    message:
      "{km} km of something. No two people are telling the same version and the committee has stopped asking.",
  },

  nodes: [
    {
      id: "wellington-statue",
      x: 670,
      y: 420,
      label: "The Wellington Statue",
      blurb: "start and finish, and he has seen it all before",
      type: "statue",
      // Out to the right, into the only quarter this junction has going spare:
      // roads leave it north, north-west and west.
      spriteDx: 58,
      spriteDy: -20,
    },
    {
      id: "claycart-bottom",
      x: 525,
      y: 385,
      label: "Claycart Bottom",
      blurb: "the dip where all the cold sits",
      labelAbove: true,
    },
    {
      id: "banger-track",
      x: 390,
      y: 330,
      label: "The Banger Track",
      blurb: "stock cars on a Saturday, silent on a Thursday",
      type: "car",
      labelAbove: true,
    },
    {
      id: "rushmoor-arena",
      x: 470,
      y: 220,
      label: "Rushmoor Arena",
      blurb: "pigeon hotspot, and they own the stands",
      type: "pigeon",
      // Counts as a hotspot; should not be drawn as one. The arena is the
      // building, the birds are simply on it.
      sprite: "sportscentre",
      // Left of where the type would put it, to get the building off the track
      // climbing to Puckridge Hill. `sportscentre` is exempt from the test that
      // keeps landmarks out of the roads — on the Loopy map the road round the
      // building is the whole point of the junction — so nothing but the eye
      // was ever going to catch this one.
      spriteDx: -34,
    },
    {
      id: "wharf-copse",
      x: 645,
      y: 265,
      label: "Wharf Copse",
      blurb: "a corner of trees, and the only bench out here",
      type: "woods",
      labelSide: "right",
      // Up and left, into the wedge between the two roads climbing north.
      spriteDx: -62,
      spriteDy: -42,
    },
    {
      id: "puckridge-car-park",
      x: 690,
      y: 130,
      label: "Puckridge Car Park",
      blurb: "somebody has left their lights on",
      type: "carpark",
    },
    {
      id: "puckridge-hill",
      x: 525,
      y: 105,
      label: "Puckridge Hill",
      blurb: "massive hill, and it goes on",
      type: "hill",
      labelAbove: true,
      // Further out and lifted: the track down to Laffan's Plain leaves
      // across the spot a hill marker usually takes.
      spriteDx: -66,
      spriteDy: -10,
    },
    {
      id: "laffans-plain",
      x: 355,
      y: 145,
      label: "Laffan's Plain",
      blurb: "pigeon hotspot, and Cody flew off it in 1908",
      type: "pigeon",
      // The other hotspot, drawn as what is actually there: the first
      // aeroplane in Britain went up off this field and the sheds never left.
      sprite: "hangar",
      labelAbove: true,
      // Clean over the top of its own name rather than tucked beside it. The
      // default -46 lands the shed in the middle of the writing, so this goes
      // far enough up to clear the whole label box and read as the thing the
      // name is naming.
      spriteDx: 2,
      spriteDy: -70,
    },
    {
      id: "eelmoor-plain",
      x: 180,
      y: 240,
      label: "Eelmoor Plain",
      blurb: "sand, in your shoes, immediately",
      type: "sand",
      labelAbove: true,
      // Off to the left of the junction: the track south to Long Valley
      // goes straight down through the middle of the sand.
      spriteDx: -36,
      spriteDy: 30,
    },
    {
      id: "long-valley",
      x: 130,
      y: 375,
      label: "Long Valley",
      blurb: "tank ruts, and every one of them full of water",
      type: "mud",
      labelAbove: true,
    },
    {
      id: "jubilee-plantation",
      x: 255,
      y: 470,
      label: "Jubilee Plantation",
      blurb: "pines, needles, and no view whatsoever",
      type: "woods",
    },
    {
      id: "firs-hill",
      x: 455,
      y: 480,
      label: "Firs Hill",
      blurb: "the last climb, and everyone knows it is coming",
      type: "hill",
      // Down and out: three roads leave this junction and the marker's
      // usual place to the left is one of them.
      spriteDx: -48,
      spriteDy: 25,
    },
  ],

  roads: [
    // Claycart Road, out of the garrison and up past the raceway.
    {
      id: "statue-claycart",
      from: "wellington-statue",
      to: "claycart-bottom",
      distanceKm: 1,
    },
    {
      id: "claycart-bangers",
      from: "claycart-bottom",
      to: "banger-track",
      distanceKm: 0.8,
    },

    // Arena Lane and Rushmoor Road, north to the Fleet road.
    {
      id: "bangers-arena",
      from: "banger-track",
      to: "rushmoor-arena",
      distanceKm: 0.7,
      pigeonRisk: 0.5,
    },
    {
      id: "arena-wharf",
      from: "rushmoor-arena",
      to: "wharf-copse",
      distanceKm: 1.1,
      pigeonRisk: 0.4,
    },

    // Laffan's Road and Puckridge Gate Road, round the top.
    {
      id: "wharf-puckridge-park",
      from: "wharf-copse",
      to: "puckridge-car-park",
      distanceKm: 0.9,
    },
    {
      id: "puckridge-park-hill",
      from: "puckridge-car-park",
      to: "puckridge-hill",
      distanceKm: 0.8,
      hill: true,
    },
    {
      id: "puckridge-hill-laffans",
      from: "puckridge-hill",
      to: "laffans-plain",
      distanceKm: 1,
      surface: "trail",
      hill: true,
      pigeonRisk: 0.5,
    },

    // The training area, west and then south. All of it is track.
    {
      id: "laffans-eelmoor",
      from: "laffans-plain",
      to: "eelmoor-plain",
      distanceKm: 1.2,
      surface: "trail",
      pigeonRisk: 0.4,
    },
    {
      id: "eelmoor-valley",
      from: "eelmoor-plain",
      to: "long-valley",
      distanceKm: 0.9,
      surface: "trail",
    },

    // Bourley Road and Wellesley Road, home through the pines.
    {
      id: "valley-jubilee",
      from: "long-valley",
      to: "jubilee-plantation",
      distanceKm: 1,
    },
    {
      id: "jubilee-firs",
      from: "jubilee-plantation",
      to: "firs-hill",
      distanceKm: 0.7,
      hill: true,
    },
    { id: "firs-statue", from: "firs-hill", to: "wellington-statue", distanceKm: 1.4 },

    // And the ways across the middle, which is where the run is actually
    // decided: nine of these twelve junctions can be cut out by one of them.
    {
      id: "claycart-firs",
      from: "claycart-bottom",
      to: "firs-hill",
      distanceKm: 1,
    },
    {
      id: "wharf-statue",
      from: "wharf-copse",
      to: "wellington-statue",
      distanceKm: 1.8,
    },
    {
      id: "arena-puckridge-hill",
      from: "rushmoor-arena",
      to: "puckridge-hill",
      distanceKm: 1.5,
      surface: "trail",
      hill: true,
      pigeonRisk: 0.4,
    },
    {
      id: "puckridge-hill-wharf",
      from: "puckridge-hill",
      to: "wharf-copse",
      distanceKm: 1.2,
      surface: "trail",
      hill: true,
    },
    {
      id: "eelmoor-bangers",
      from: "eelmoor-plain",
      to: "banger-track",
      distanceKm: 1.2,
      surface: "trail",
    },

    /*
     * The Long Valley crossing, shut because the range is live. Red flags go
     * up on this ground for real, and going anyway is exactly the sort of
     * decision a group of adults makes when one of them says they are sure it
     * is fine.
     */
    {
      id: "bangers-valley",
      from: "banger-track",
      to: "long-valley",
      distanceKm: 1.2,
      surface: "trail",
      closed: true,
    },
  ],

  /*
   * The three bits of this map that are not heath. A raceway is an oval of
   * hardstanding with a car park attached, the ground at Claycart Bottom is
   * the apron and the approach that serve it, and a car park is a car park.
   *
   * Drawn first of everything, under the roads and the scenery, which is what
   * makes it ground rather than a shape: a road crossing it is the point. The
   * grey is the trail theme's own — see `ground-patch--trail` — and they abut
   * without overlapping, because two overlapping patches merge into a single
   * shape with a seam across it.
   */
  ground: [
    { x: 300, y: 280, width: 168, height: 108 },
    { x: 492, y: 342, width: 134, height: 92 },
    { x: 618, y: 74, width: 152, height: 106 },
  ],

  // Heath, plantation, and the army, which was here first and has not left.
  scatter: [
    // Dug in around the plain, each facing whichever way its flip says.
    { x: 250, y: 240, kind: "soldier", variant: 1 },
    { x: 285, y: 255, kind: "soldier", variant: 3, flip: true },
    { x: 150, y: 145, kind: "soldier", variant: 0 },
    { x: 300, y: 40, kind: "soldier", variant: 2, flip: true },

    // Gorse, sand and the odd boulder.
    { x: 60, y: 70, kind: "gorse", variant: 1 },
    { x: 60, y: 470, kind: "gorse", variant: 1 },
    { x: 350, y: 420, kind: "gorse" },
    { x: 620, y: 350, kind: "gorse", variant: 1 },
    { x: 95, y: 300, kind: "rock" },
    { x: 440, y: 60, kind: "rock" },

    // And the bits of it that are open to the public.
    { x: 745, y: 340, kind: "tree" },
    { x: 555, y: 520, kind: "tree" },
    { x: 620, y: 175, kind: "bench" },
    { x: 205, y: 105, kind: "signpost" },
    { x: 330, y: 500, kind: "dog" },
    { x: 500, y: 300, kind: "butterfly" },
    // The range warning, which everybody reads and nobody acts on. Out on the
    // open ground between the arena and the raceway, where it is not leaning
    // on either building.
    { x: 390, y: 230, kind: "warning" },
  ],
};
