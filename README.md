# About Five Kilometres

A browser route-planning puzzle for Wellesley Runners, a club that takes its
Thursday social run far too seriously. Plan a loop through town, keep everyone away from
the pigeons, and get the group back to the Observatory in one piece.

Built with React, TypeScript, Vite and hand-drawn inline SVG. No game engine
and no canvas. Almost every sprite is vector drawn in `MapSprites.tsx`; the
handful of bitmaps (the cow, the Duke, the ghost, the soldiers, the goose, the
dog, the Medical Centre Toilet, and two of the how-to-play drawings) live in
`public/sprites/`, cropped to their content and sized to a few times the space
they are ever drawn in.

One of them is not on the map at all. The standing pigeon is the game's only
sprite that turns up on the furniture — the how-to-play strip, the club's
incident report, the privacy policy, and the club table before anybody has
joined it. He is not the flock: the birds on the map are vector, they are an
obstacle, and the rules count them. He is a bystander with opinions, he is
`alt=""` in all four places, and `Pigeon.tsx` is the one component so that
adding a fifth is a line rather than a copied path.

One asset there is not a PNG. The countryside behind the how-to-play screen is
a soft painterly landscape, which is the one thing PNG is worst at: 584 kB
against 51 kB as WebP, for no difference anybody can see, on a dialog that
opens itself on a first visit. Line art with flat colour stays PNG, where the
gap runs the other way.

## The levels

**Level 1 — Thursday Social Run** — twelve junctions, twenty roads, and one
closed shortcut of questionable legality. A loop, in which a successful route
must:

- start at The Observatory
- finish back at The Observatory
- cover between 5 km and 7 km
- visit the canal (Canal Bridge or the Grubby Towpath)
- avoid the closed road
- pass through no more than one pigeon hotspot

**Level 2 — Caesar's Camp** — a loop out from the Overpriced Car Park and
back over the heath: reach 10 km, greet the cows, stay off the tarmac, avoid
the pigeon barn, and mind the path closed for lambing. Its id is still
`sunday-trail-run`, which is what it was called first: progress is a list of
ids, so renaming it would take the run off everyone who had already done it.

**Level 3 — Thursday Town Run** — the Observatory and its four northern
neighbours from level 1, and then everything above them that the social run
never bothers with. The hardest of the first three: 7 to 8 km, taking in
both Aldershot Town Centre and the Wellington Statue at opposite ends of the
map, past no more than one of the two massive hills, and not down the road
they have had fenced off since March. Two routes satisfy all of it, against
nine on level 1.

**Level 4 — Fleet Pond** — a wheel: the track round the water, the places
beyond it, and the paths joining the two. Middling difficulty, eight winning
routes. Nothing on this map is a dead end, which is deliberate — every corner of
the pond can be reached more than one way, and that is how a group of adults
ends up somewhere they did not intend to be. The pond itself is drawn from the
ring of junctions on its bank, the same way the canal on level 1 is drawn from
its two canal junctions.

Level 4 is where the goose lives, and level 6 is where it turns up again. A
level may list `followers`: things that wait by a junction and, when the group
runs past them, fall in at the back and follow to the finish, turning to face
the way they are going. Plan a route that misses the Jetty — or the paddling
spot on the Tilford map — and it stays exactly where it was. The cows at Cow
Corner, by contrast, do nothing at all: greeting them is its own reward.

It is a list because a map may have several. The Christmas Run has carol
singers on three corners as well as the goose, and picking up two of them is a
different run from picking up none. They queue behind the group in the order
the route reaches them — whoever is picked up first tacks onto the back, and
the next one in behind them — so the order is the route's, not the order the
level happens to list them in.

**Level 5 — Loopy** — the Thursday map from the Observatory down, lifted to
make room for what is underneath it. The signature is the road round the Sports
Centre: two roads joining the same two junctions, one either side of the
building, so the pool at the back can only be reached by going round. Three
winning routes, and the map that most rewards knowing that a route is its
roads and not the order you laid them in: those three can be run sixteen ways
between them, more than five journeys per route and the highest ratio on the
roster.

**Level 6 — Tilford** — a trail loop from the Barley Mow, and the hardest run
on the roster: 7.5 to 8 km, over the river bridge, along to the goose at the
paddling spot, off the village lanes, and not across the stepping stones, which
are under water. Four winning routes — four loops, each of which works either
way round, which is the same route twice and banks once. The Posh Cows are on
one of them and compulsory on none of them, and the Village Shop is reachable
only on tarmac, so a legal run can never get to it at all.

**Level 7 — Spooky Run** — the Town Run map on the last Thursday in October,
after dark. The Big Tesco and the Duke are gone and every road off them with
them; a Spooky Church now stands on the hill road between Wellesley Rumble and
Redan Road; the pigeons are crows; and the east side is a street of trick or
treaters no group of adults gets through. Four winning routes, three of them
over Redan Road and one over the ski slope.

A handful of fields carry the whole of Halloween, and the rules never learn
about any of them: `mood: "dusk"` takes the light out of the map — and with it
turns the hills orange, the gardens a sickly olive, the town centre purple, the
gardens' trees bare, and the game's own title italic and violet — `flock:
"crow"` decides what the birds are, `music` names the level's own track, and
`scatter` puts the moon, the bats, the pumpkins, the gravestones and the
signposts where they go. Fog drifts along the bottom of any map at dusk.
Levels without those fields are daylight, pigeons and the house theme.

The trick or treaters are a `follower` too: run the group into their street and
some of them come along at the back, exactly as the goose does. Losing has
never looked better.

One junction on that map sets `spriteOnTop`, which draws its landmark over the
roads instead of under them. The ski slope has the road along the top of the
map running through the only place its marker can stand.

**Level 8 — Hawley Lake** — a lap of open water, and the first map built round
a lake rather than past one. 9 to 11.5 km from the Sailing Centre, taking in
Minley Manor at the top of its avenue and the birds at Bird Bay, with two epic
hills you may have one of and a range road the Ministry has shut. Four winning
routes. The lake is drawn from the ring of four bank junctions, exactly as
Fleet Pond is, and the islands and dinghies are scattered on top of it.

Its birds are ducks — `flock: "duck"` — which is the same mechanism as the
Spooky Run's crows: they loiter, scatter and get counted identically, and only
the drawing and the paperwork change. The goose is at Bird Bay, and it follows.

**Level 9 — Christmas Run** — the level 1 map in December, with two things
swapped over. The Back Passage is open, because there is mulled wine on it, and
the towpath is shut everywhere the lights do not reach: three closed roads
against level 1's one, leaving the lit stretch from the Canal Bridge to the
Medical Centre and nothing else. Level 1 gives you the canal two ways; this one
gives it to you over the bridge or not at all. 7.5 to 11 km, taking in the
bridge and the town tree, past no more than one lot of robins. Seven winning
routes, which is second only to level 1 across the whole roster.

The Mulled Wine Stop is deliberately *not* in the brief. Three of the seven
winners go by way of it and four do not, so it is a real choice rather than a
waypoint — and the scoring already pays for junctions taken in beyond what was
asked, which is the right way to reward a detour nobody demanded.

Christmas is declared the same way Halloween is, and the rules learn nothing
new: `mood: "frost"` is the opposite of dusk — the light stays but arrives
through ice, so the map goes blue and pale, the pond and the canal set, the
trees come up bare and the only warm thing left is what is coming out of the
windows. `flock: "robin"`, `music`, and `kit: "santa"`, which puts the group in
hats and changes nothing else. Snow falls over any map at frost, and frost
creeps in from its four corners.

**Level 10 — Thursley Common** — the furthest away run yet, and a real
National Nature Reserve: 350 hectares of heath and peat bog in Surrey with a
boardwalk laid out over the mire. 8 to 10 km from the Moat Pond car park, out
over the boardwalk, past the dragonflies at Pudmore, round by the Atlantic
Wall and home. Six winning routes.

Its flock is `dragonfly`, which is the same mechanism as the crows, ducks and
robins and the first one the level *sends you towards* rather than round.
Everywhere else the birds are an obstacle and the brief caps them; here they
are the reason anybody drove an hour, and the brief makes Pudmore compulsory.
Capping them was tried first and produced a dragonfly level whose winning
routes all avoided the dragonflies.

The Atlantic Wall is real too, and is next door on Hankley Common rather than
on the reserve: a full-size replica of a stretch of the Normandy defences,
built in 1943 for the Canadians to practise blowing up and never tidied away.
The club has stretched the geography to take it in, as the club would.

Two junctions on it — Elstead Green and the Three Horseshoes — sit on lanes
only, and the brief says stay off the lanes, so no legal run can reach either.
That is the Tilford Village Shop trick again: a village you can see from the
heath and never get to.

The closed road is the bridleway between Moat Pond and the Mire, which is
genuinely under 600 mm of water from October. The dog is genuine too — leads
are compulsory on the reserve from April to September, which is exactly the
sort of rule somebody's dog has never heard of, so it falls in at the Mire and
comes with you.

**Level 11 — Thursday Night Run** — the third Thursday on the roster, and the
one that leaves town altogether. Out from the Duke of Wellington on Round Hill,
up Claycart Road past Aldershot Raceway, north by Rushmoor Arena and Wharf
Copse, round Puckridge Hill and its car park, and home across Laffan's Plain,
Eelmoor Plain, Long Valley and the pines of Jubilee Plantation. 8.5 to 11 km,
taking in the banger track and Puckridge, past no more than one pigeon hotspot,
and not over the Long Valley crossing while the range is live. Five winning
routes.

Every name on it is real and so is the ground — this is Aldershot military
training area, which is why a red flag matters and why nobody out there is
surprised by soldiers. Red flags do go up on Long Valley, and going anyway is
exactly the decision a group of adults makes when one of them says they are
sure it is fine.

The squeeze is the hotspots. Both ways north out of the banger track go through
one — Rushmoor Arena on the near side, Laffan's Plain on the far — so every
legal run disturbs exactly one, and the cap of one is binding rather than
decorative. The route the club actually runs takes both in, and fails.

It is a Thursday and it is drawn like one: no `mood`, no `flock`, no `music`,
exactly as levels 1, 3 and 5. Those three fields between them are the Halloween
and Christmas kit, and reaching for them makes an ordinary week look like an
occasion. The first draft went out at dusk with crows and simply read as a
second Spooky Run, so `nightLevel.test.ts` now asserts all three are unset —
which is a cheaper way of saying "this is not the seasonal one" than a comment
is. `theme: "trail"` stays, because the ground really is heath and plantation;
the town theme would run terraces along the edge of Long Valley.

Two roads were cut before it shipped and neither for the look of the thing.
Rushmoor Arena to Laffan's Plain enabled no winning route at all and cost 1,760
wrong ones. The chord from Long Valley to Firs Hill undercut Bourley Road so
cheaply that the plantation, Long Valley and Firs Hill were on no winning route
between them — three landmarks with names and nothing to do. Rank 9 and 2,638
loops came down to rank 7 and 280, with more winners at the end of it than at
the start, and `nightLevel.test.ts` now holds every junction to being on one.

Objectives are declared per level as data, with their own failure copy, so the
rules in `src/game/` know nothing about canals, cows or pigeons. Scenery is
placed from junction types for the same reason. A new level really is a new
object in `src/data/` plus a line in `levels.ts` — the numbering, the unlock
gate and the fixture list all follow from the order of that array.

**Level 12 — Frensham Great Pond** — the third map on the roster with open
water on it, and the one that had to not be about the water. Fleet Pond is a
wheel round it and Hawley is a lap of it; a third drawn the same way would be
the least distinctive level here. So the Great Pond is lapped in the first
kilometre and then left behind, and the run is the crossing of Frensham Common
on Sandy Lane, out to the Little Pond and back over the Devil's Jumps. 9 to
10.5 km, both ponds, up the Jumps, and not down the path roped off for the
nesting. Six winning routes.

All of it is real, including the beach. The Great Pond has a National Trust
car park at its west end and a genuine sand shore along its north side —
families, windbreaks and an ice cream queue, in Surrey. The Sailing Club is on
Pond Lane and the Pond Hotel on Bacon Lane, two minutes from a car park full of
muddy runners. The King's Ridge is 90 m and Stony Jump, nearest of the three
Devil's Jumps at Churt, is 120 m — and the junction is labelled for the three
rather than the one, because the objective, the strapline and the instructions
all say Devil's Jumps and only a local would know those were the same hill
(#106). The specific name is in the blurb, where it can explain itself.
`levelData.test.ts` now checks the class of mistake across every level: a
waypoint's proper nouns have to appear on the junction it points at. Any word
in common would not have caught this one, since both names contain "Jump".
The closure is a real restriction rather than
a joke: the common is heath, heath has ground-nesting birds on it, and the
Trust ropes paths off through the season for exactly that reason.

The Great Pond is drawn from four bank junctions the way Fleet Pond and Hawley
are, and the order they are declared in **is** the order round the water —
`waterThrough` walks the list, so a bank junction filed in the wrong place
folds the shape inside out. `frenshamLevel.test.ts` pins that order, because
nothing else would notice until somebody looked at the map.

Two of its roads are worth the note. The chord from the King's Ridge to the
Flashes costs 456 wrong loops and enables no extra winner, which is normally
exactly the profile of a road to cut — and cutting it was wrong. Without it the
east is a single chain from the Little Pond to Stony Jump, so reaching either
end means reaching both, and the level's two waypoints can then never fail
independently. Two objectives that cannot disagree are one objective with two
ticks. Findability is worth a lot; it is not worth a rule that is quietly
pretending to be two.

**Level 13 — Farnborough Winter Half** — the first level on the roster that is
not a club run. The Farnborough Winter Half Marathon is a real race on a real
Sunday in February: one anti-clockwise lap of Farnborough Airport and Cody
Technology Park, starting and finishing under the airship hangars at
Farnborough Business Park, and 21.1 km because that is what a half marathon
is. Elles Road, Ively Road, Pyestock Wood, Miles Hill, the Aerospace Centre,
Danger Hill and Cockadobby Hill are all real and all called that. Four winning
routes.

Everywhere else the club picks a route and argues about it. Here somebody else
has already measured one and put cones on it, and the brief is 21.0 to 21.3
rather than a comfortable window because a race is measured — a route half a
kilometre out is not a slightly different race, it is a wrong one.

The best part is what that leaves. There is more than one legal way round —
through the station and Cove Green rather than straight along the top, round
Southwood rather than down Elles Road — and **every one of the four comes to
exactly 21.1 km**, because that is what having a course measured actually buys
you. The nearest thing that is not a winner is 19.5 km one side and 22.5 km the
other. You are on the course or you are not.

It carries the only three closures on the roster that are shut *for* a race
rather than in spite of one, and they are closed because of what happened when
they were not. Two of them cut a corner off the airfield, which is short, and a
lap of the town is long, so the two cancel: an early draft had four winners and
three of them cut a corner and then made the distance back up through Cove
Green. Arithmetically fine and entirely against the point. Coning them off is
also what happens on the day.

`mood: "frost"` because it is the Winter Half and it is February — the
Christmas Run's treatment on a level that is not Christmas, which is a
deliberate widening. Frost is weather, and February in Hampshire has it. It has
a track of its own too, which makes it the only level outside the Halloween and
Christmas editions with one: the house theme is a Thursday evening and this is
a start pen. `flock` stays unset.

Frost brought a problem with it. The junctions go red and green at frost, which
was written when frost meant Christmas and nothing else, and a red and green
bauble on a February start line is a decoration nobody hung. So the map SVG now
carries a `map-svg--{level.id}` class alongside its mood, and Farnborough uses
it to put the junctions back in club blue and club orange. The mood is the
weather; the tinsel is the occasion, and they are no longer the same class.

It is also the only map with race furniture on it, because a race has to look
like one before you have read a word of the brief: a start line under the arch,
with the word on it, supporters wherever a supporter can actually park, and
penguins, which are not native to Farnborough and are not going to explain
themselves. There were water stations too, briefly. A trestle table with a cup
on it is four marks at this size and reads as a bin, so they went. Cove Green
lost its trees, too: a `park` junction scatters three round itself, and three
trees on the one corner that already has a crowd and a race going through it
was the busiest place on the map. `noTrees` keeps the green and drops them.

The other thing a race has is everybody else (#111). `field: 30` puts thirty
strangers on the road, running the player's own route because that is the only
line the map has, in eight vests that are nobody's here. They are placed by two
numbers each — how far up or down the road from the club's lead runner, and how
far off the racing line — and the second one is what stops it reading as a
queue, because thirty runners on a single path in single file is a conga.

Three things about it were wrong first time and are worth writing down.
Scattering the length and the width independently draws two runners in the same
stride as one runner with four legs, so the field is laid out in two files,
odds one side and evens the other, which has the side effect of looking like a
road race. The field started four units off the line and was elbow to elbow
with the club, so five blue vests could not be found in thirty — the one thing
the field exists to make possible — and it now leaves nine units clear, which
is the racing line and the club is on it. And one of the eight vests was a sky
blue at `#23a3d4`, a shade off the club's own `#4293cf`: the field contained
the very thing it is there to contrast with. It is high-vis gold now.

Setting `field` also puts the club's own five into one vest. Blue, green and
white read as a club on an empty road and as five strangers in a crowd.

Finishing it is worth a badge of its own, **Thirteen Point One**, which is the
only badge that asks for a whole level and means it.

**Level 14 — Crooksbury Hill** — the away day that is entirely about the
climbing. Crooksbury Hill is 162 m with a trig point on top, the 21st highest
hill in Surrey, and Hindhead is visible from it on a good day. Round it, on the
Greensand Ridge between Farnham and Guildford: Soldier's Ring on its own
hillside, Hillbury — an Iron Age hillfort and a scheduled monument — over
Cutmill Pond, Botany Hill above The Sands, and the Hog's Back with Seale at the
foot of the scarp. General's Pond was dug by hand to feed Puttenham Priory,
Farnham Golf Club really is at The Sands, and The Good Intent really is in
Puttenham. 12 to 14 km, the trig point, the hillfort, and seven climbs. Four
winning routes, all of them 13.3 to 13.8 km.

The design problem was not the geography. `paceOf` drops the group to 55% of
its speed on a road marked `hill`, but the run always takes the same eight
seconds, so a climb costs the *flat* legs their time rather than making the run
longer. Mark every road as a hill and `totalCost` scales by the same factor
everywhere, `fractionAt(effort)` collapses back to `effort`, and the level
animates exactly like a flat one. **A map where everything is a hill has no
hills at all.** So eleven of the nineteen roads climb and eight do not, and the
eight flat ones are what make the eleven mean anything — which is also true of
the actual place, where the lanes along the bottom are the only flat ground for
miles. `crooksburyLevel.test.ts` pins both halves: the horseshoe's pace curve
bends off the straight line, and a route of nothing but climbs is a straight
line to ten decimal places.

Two things worth knowing if you retune it. The distance *floor* cannot fire:
seven climbs cost more than twelve kilometres before you have run a step of
anything flat, so the "too short" copy is unreachable by construction, and
there is a test saying so rather than a comment hoping so. And the estate track
from Hampton onto the common exists for one reason — without it every route
that reaches Hillbury is forced on to Crooksbury, since the hillfort's only
other neighbours are the two ponds and both lead back the way you came, so the
two waypoints could never fail apart. Frensham learned that the same way.

### What a place is standing on

A trail map tints its whole ground green, which is why those maps read as
being somewhere. A town map had no equivalent and was one flat beige with
things drawn on it, which is what issue #101 was about.

The fix is not the same trick in grey. A field really is uniformly a field; a
town is not uniformly built up, and tinting the lot would swap one flat colour
for another. So `ground` is a list of rectangles per level — the retail park,
the terrace, the airport apron, the sports centre car park — and everything
between them stays paper. Two or three to a map is enough; the point is the
contrast, not the coverage.

It is drawn first of everything, under the water and the gardens and the
roads. That is what makes it ground: a road crossing it is the point rather
than a clash, and the only thing it can get wrong is running off the paper,
which `scenery.test.ts` checks along with everything else it checks. Grey and
cool rather than another beige, so it separates from the paper instead of
reading as a printing fault, and it goes with the light — blue-grey at dusk,
paler at frost — so a town stays one place under one sky.

It is no longer town-only, which it was until the Thursday Night Run wanted
grey round the raceway and the Puckridge car park. "A trail map is already a
field" turned out to be nearly true rather than true: a trail map is *mostly* a
field, and an oval of hardstanding with a car park attached is not one. Drawing
it as grass is the same mistake as flat beige, pointing the other way.

What that did need was a second colour. The town's `#ebe7dd` was mixed to sit a
shade off cream paper; on grass it reads as a pale warm blotch rather than as
concrete, so `ground-patch--trail` is neutral and a touch darker. Both sit at
lower specificity than the dusk and frost rules, so the light still wins over
the theme. The test that used to forbid ground off a town map now forbids two
patches overlapping instead — two of them on top of each other merge into a
single shape with a seam across it, which is neither of the areas anybody
meant.

### How dense a new map can afford to be

One number is worth watching when drawing a new level, because it is the only
thing here that costs the player anything: **roads minus junctions**, plus one.
That is the map's circuit rank — how many independent loops it has — and the
number of possible routes grows roughly exponentially in it. `winningRouteCount`
walks every one of them to work out the "N routes to find here" denominator.

| Level | Junctions | Roads | Rank | Loops | Cold walk |
|---|---:|---:|---:|---:|---:|
| Tilford | 11 | 21 | 11 | 1,183 | 50 ms |
| Thursday Social | 12 | 20 | 9 | 194 | 17 ms |
| Thursley Common | 12 | 20 | 9 | 311 | 13 ms |
| Christmas Run | 12 | 20 | 9 | 194 | 13 ms |
| Spooky Run | 12 | 20 | 9 | 211 | 8 ms |
| Caesar's Camp | 12 | 19 | 8 | 145 | 4 ms |
| Thursday Night | 12 | 18 | 7 | 280 | 1 ms |
| Frensham | 12 | 19 | 8 | 790 | 6 ms |
| Farnborough | 12 | 18 | 7 | 192 | 2 ms |
| Town, Fleet Pond, Loopy, Hawley | 11–12 | 17–18 | 7 | 33–72 | 0.6–1.5 ms |

Two extra ranks is thirty times the work. It is memoised per level in a
`WeakMap`, so it is paid once per level per page load rather than per render,
and fifty milliseconds on the hardest map on the roster is a price worth
paying. But a map meaningfully denser than Tilford would not be a little
slower than Tilford, it would be a lot slower, and it would be found out on
somebody's phone rather than here. Rank 7 to 9 is where thirteen of the
fourteen levels sit and is the comfortable range; past 11 wants measuring
before it ships. Tilford, at 11, is the one that is not.

Rank is the ceiling rather than the count, though, and the Thursday Night Run
is the row that says so: rank 7, like four other maps, and four times their
loops between them. What the other four have is a long way round with few ways
off it. Spread the same number of roads evenly and every junction becomes a
decision, which is the thing that actually multiplies. Two maps at the same
rank can differ by an order of magnitude, so measure rather than assume.

The lever, if a map comes out too tangled, is not to delete a road. Splitting a
busy junction into two that do not join each other sheds a rank and keeps every
path — two routes crossing without meeting, which on the ground is a footbridge
over a track or a river with no ford at that point. Subdividing a road does not
help: it adds a junction and a road, and the rank comes out the same.

The same density is what decides how many *wrong* routes a level has, since
failures are simply every loop that is not a winner. Tilford has 1,179 of them
against four winners, which is a hit rate of one in 296; the Thursday Night
Run's 275 against five is one in 56, Frensham's 784 against six is one in 132,
and no other level is worse than one in 53.

A level may also `scatter` scenery by hand, on top of whatever its theme puts
down, for the corners no road reaches — cats, bins, traffic lights and parked
cars in the towns, dogs and benches out of them, gnomes and loitering youths,
flowers and butterflies and an ice cream van at Tilford, the moon and the bats
after dark, the running track behind the Sports Centre's car park on Loopy, the
start line and supporters and penguins at Farnborough, and the four plastic
soldiers dug in around the Eeek Soldiers junction, each facing whichever way its
`flip` says.

The track is drawn as a stadium — two straights and two bends, `rx` at exactly
half the height — rather than as an ellipse, because an ellipse with lines on
it reads as a pond somebody has scribbled over. Its lanes are one inner outline
and not six: at the size scenery sits on the map, six of them turn to mud.

Where a junction needs its landmark or its label somewhere other than where its
type puts every other one — because a road happens to run through the spot — it
says so itself with `spriteDx`, `spriteDy` or `labelDy`. Landmarks are drawn
under the roads, so a sprite left sitting on one is simply lost beneath it.

Note that an objective has to be *failable* to be worth declaring. "Never use
the same road twice" used to be on every level and could never fail, because
`selectNode` refuses a road already in the route; it sat there reading "Passed"
for the whole game. The rule is still enforced, it is just not scored.

Every objective bar one forbids something, asks you to be somewhere, or caps a
distance. The exception is `climb`, added for Crooksbury: take at least this
many roads marked `hill`. It counts roads and not summits, deliberately, so
that walking up the lane to a hilltop does not satisfy it, and it stays
`incomplete` rather than `failed` while the route is short — like an unreached
waypoint, because there may be more road to come, and a checklist that goes red
on the first leg of every route is telling the player off for not having
finished yet. It sits below `visit` in `FAILURE_PRIORITY`: missing Crooksbury
Hill and being two climbs short are the same mistake, and the one with a place
in it says more about what went wrong than a number does.

Declaring `climb` also rewrites one line of the incident report. "Unnecessary
hills" becomes "Hills climbed", scored against the number the level asked for
instead of left as a neutral tally. Identical quantity, opposite joke: on a
Thursday a hill is something you needlessly ran up, and at Crooksbury it is the
reason anybody got in a car. `unnecessaryHills` is now `hillsTaken` for the
same reason — the function counts, the report editorialises.

## Progression

Levels run in the order `src/data/levels.ts` declares them. Level 1 is open to
everybody; every level after that opens when the one before it has been run
successfully, and once opened it stays open — the **Level _n_** button in the
header brings up the fixture list to run an old favourite again.

A returning player opens on the run they are up to — the first one open to
them that they have not completed — rather than back at level 1. Once the whole
roster is behind them they land on the last level.

Losing does not cost anything. You can attempt an unlocked run as often as you
like, and plan a deliberately terrible route without being sent back anywhere;
you simply do not bank the level until a run meets its brief.

Progress is a list of completed level ids in `localStorage`. `src/game/`
holds the rules — what is unlocked, what comes next, what is standing in the
way — as pure functions over the roster, so they are tested without a browser.
A level completed under an older roster stays unlocked even if the levels are
later reordered.

The objective checklist updates as you build. Objectives that cannot yet be
decided — finishing the loop, reaching the canal — stay at "Not yet" rather
than showing a premature failure.

You can knowingly plan a losing route and run it anyway. That is most of the
fun.

## Scoring

Club points, all-time, and they come from **routes discovered** rather than
runs completed. Finish a route that meets the brief and it goes in the book
once, worth 50 for the brief, 10 an objective, 3 a junction taken in beyond
what was asked, and 5 for each of those that was worth seeing. Run it again
and it is worth nothing: the panel says so and the total does not move. A run
that missed the brief scores nothing either, but it is still logged, because
what you have explored is worth knowing.

That shape is deliberate. Points per *run* would mean the best strategy is to
run the easiest level forever; points per *discovery* cannot be farmed, and the
distance window stops the grand tour being a strategy rather than a choice.
There are 68 winning routes across the fourteen levels — `winningRouteCount`
summed over the roster — and 2,889 distinct loops that get home without using a
road twice, counted the way the game counts them, with a lap and the same lap
backwards as one. So a completed fixture list is nowhere near a finished game.

How much of a map is still out there is said in three places, because a total
nobody can see is not a total. The header carries the club's all-time points
once there are any; the objective panel says how many routes this map has left,
so a level you have already beaten still shows what it is holding back; and the
fixture list breaks it down per level. A shared run carries the same two
figures, which is the only advert the game has until there is a table.

Behind the objective panel's count is **the book**: every route you have run on
that level, drawn as a shape over the map's own roads. Winners first, shortest
to longest, and then the ones that did not work — because the thing that makes
hunting a map tiring is not knowing which of the routes you tried already
failed, and the run book had quietly been keeping them all along. A dud even
says why it was a dud, in the level's own words.

The duds come **nearest miss first**, counted as objectives not satisfied, and
only the closest twelve are shown. Recency was the obvious order and the wrong
one: the reason to look a dud up is to change a road and try again, and a route
that failed on one objective is worth reopening in a way that a route that
failed on four is not. Ties go to the most recent. It matters most exactly
where the book is under most strain — Tilford has 1,179 ways to lose, and
twelve of them chosen well is a hunting aid where twelve chosen by clock is a
list.

"Not satisfied" rather than "failed" is deliberate, and the distinction is the
objective panel's. While a route is being planned, an objective that cannot yet
be decided reads "Not yet" rather than showing a premature failure — so a loop
that comes home under the distance never reaches "failed" at all, and it is the
commonest near miss there is. In the book the run is over, and not yet means
never.

Nothing new is stored for any of it. `src/game/runBook.ts` rebuilds each route
from its road ids and works the distance, the points, the win and the verdict
out on the spot — the same rule the scoring follows, so a rebalance rewrites
the whole book rather than stranding it. The one thing the book will not do is
show you a route you have not found: the count of what is left is the whole of
the help on offer.

**Tap one and it goes back on the map**, to run again or to edit into something
near it — which is how you actually hunt a variation on a loop that nearly
worked, rather than laying the whole thing again a road at a time. Whatever was
being planned is dropped without a confirmation: going into the book and
picking a route out of it is a clearer statement of intent than a half-laid
route is, and if it was a mistake the route is on screen and re-tappable.
Reset still means empty, not back to what was loaded.

There is no such thing as an entry that will not load. `pageFor` already drops
any route whose roads have stopped describing a walk — a map edited under it —
so a route the level has outgrown is not in the book to be pressed in the first
place, and the loading path has no failure case to report.

## Sharing a run

Every finished run offers a picture of itself: the map, the route drawn over
it, what the club made of it, and the three figures worth boasting about.

It is **built rather than screenshotted**, and that is the whole design.
Serialising the map on screen looks like the obvious move and produces a page
of unstyled paths with broken image links — a detached SVG has no stylesheet,
and a canvas will not fetch what a `<image href>` points at. Worse, one
external reference taints the canvas and `toBlob` throws instead of returning a
picture, so the failure is a share with no image and nothing in the console.

So `src/game/shareCard.ts` writes the SVG from scratch, every colour spelled
out as an attribute, nothing pointing anywhere. It is pure, so the test can
read it: `shareCard.test.ts` walks a real loop on every level and checks the
card has no `<image>`, no `url(`, no external `href`, and no `class` — the four
ways this quietly stops working. That is worth more than checking it looks
right, because looking right is not the failure mode.

It is also why the scenery is missing. The cow, the goose and the Duke are all
PNGs. The route, the roads it was run on, and the verdict are the parts worth
looking at anyway, which is the same call the run book's thumbnails make.

Rasterising is the twenty browser-only lines in `components/shareImage.ts`, and
all of it is best-effort: no canvas, no blob, a share sheet that refuses files
— any of them falls back to sharing the words, which is what the button did
before. `navigator.canShare({ files })` is the guard, because plenty of share
sheets take text and refuse a PNG.

Desktops never see a share sheet at all — the button opens the game's own menu
there, for the reasons in `ShareButton.tsx` — so the menu grew a **Save the
picture** entry. Without it the best part of the feature would exist only on
phones.

### Where the picture cannot go

Two places, and both are worth knowing before wondering why a share looked
thin.

**Instagram is not in the menu and cannot be.** It has no web share intent —
there is no URL that opens a composer, the way there is for WhatsApp, X,
Facebook and Threads — so there is nothing to link to. On a phone it is in the
native share sheet, which opens *instead* of the menu, and the picture goes
with it. On a desktop the route is Save the picture and then post it.

That last part stays unsaid in the interface. A line of explanation under the
option was tried and taken out again: a menu is a list of things to press, and
a paragraph about what Instagram will not accept is documentation that has
wandered into the wrong place. **Save the picture** is a clear enough action to
stand on its own.

**Facebook only ever gets a link.** Its sharer takes a `u` parameter and
nothing else, then builds its own preview by fetching that URL. No image from
the browser can reach it, on any device. That is not a limitation of the share
card; it is what Facebook's sharer is.

### The link preview

Which is what `og:` in `index.html` is for, and it had none — so every share of
the URL, anywhere, rendered as a bare blue link with nothing to look at. That
is the thing people actually saw.

There is now a proper set of Open Graph and Twitter tags, and a 1200×630 cover
at `/og-card.png`, drawn by `scripts/build-og-card.mjs` in the game's own
colours and committed. The URLs in those tags are absolute, because crawlers do
not resolve relative ones and `og:image` is the one that most often fails
silently for it.

It is a picture of *the game*, not of your run, and it cannot be otherwise: a
crawler fetches it from the site long after the run is over, and the site is
static, so there is nowhere to generate a per-run one. The two pictures do
different jobs — the share card is handed to a share sheet by the browser, the
cover is fetched by somebody else's server — which is why there are two of
them.

Rasterising is `sips`, macOS's own converter, so CI cannot rebuild the PNG and
does not try. `qlmanage` is the more obvious shortcut and drops every `<text>`
element on the floor, which on a picture that is mostly the game's name is not
a small defect.

`src/game/scoring.ts` is pure, like the rest of `src/game/`, and versioned.
**Nothing anywhere stores a score.** `src/game/records.ts` keeps the routes —
just lists of road ids — and every total is derived from them on the spot.
Rebalancing the scoring is therefore a redeploy rather than a migration, and
when there is a leaderboard, the server can recompute a submitted route rather
than believing a number the client sent it.

### What counts as one route

**A route is the set of roads it uses.** Run a loop clockwise and then run it
anticlockwise and the club has been down the same roads twice: it banks once,
scores once, and appears in the book once. The same goes for the order the
roads were laid in — an out-and-back round the Sports Centre is the same route
whichever side you take first.

This is a decision rather than an oversight, and it is worth being clear that
it cuts against how a runner usually thinks. A Strava segment is directional;
these are not. The reason is the size of the job it would otherwise be. Under
directional counting level 1 asks for twenty-four runs rather than nine and the
Christmas Run asks for thirty-two rather than seven, and most of the extra is
the same roads in a different direction — which is tedious to grind and, more
to the point, is not a new discovery. Fewer, realer routes beat a longer list.

`routeKey` in `src/game/scoring.ts` is where this lives: it sorts a route's
road ids, so direction and order fall out of the identity. Everything
downstream inherits it — the run book, the "routes to find" count, whether a
run scores as a discovery, and the `route_key` the server stores. One rule,
one place. The help dialog puts it to the player in one line, because a rule
that decides what banks is not one to leave them to infer.

Whether direction should be an option rather than a rule is an open question,
and issue #81 is where it is being argued.

## The trophy cabinet

Badges, earned by running, and **nothing about them is stored either**.
`src/game/achievements.ts` asks each one of the routes in the book on the spot,
the same way the scoring does, so retuning a badge re-awards everybody's
history rather than stranding it. A patch on the wall is a question with a yes
in it, not a flag somebody set once.

That rule shapes what a badge can ask. `recordRun` is idempotent — running a
route already in the book records nothing — so the book is a set of discoveries
and not a diary: it knows what the club has been down, and not what it did last
Thursday and the Thursday before.

Worth being precise about what that does and does not forbid, because it is
easy to dress a gap up as a principle. What is deliberate is that **nothing
derived is stored** — no points, no badges, no totals. A log of runs would not
breach that at all; a road id and a timestamp is the same kind of raw
observation the book already keeps. Nobody ever ruled one out. It has simply
never been needed, and it would be the first thing here that could not be
rebuilt from what is left if it were lost.

Show Off is the badge that ran into this. Asked for as "five perfect runs in a
row", it wanted a diary. Asked for as **a whole map found without one bad run
in the book**, it wants nothing new: the book keeps failures as well as
successes, so it can already say whether a level's page is all winners. It is
the better badge for it — the literal version could be farmed by running one
known winner five times over.

The numbers were checked against what the maps can actually produce, which is
`achievements.test.ts`'s main job: it walks every level looking for a route
that wins each badge, and fails on any badge nothing can earn. That test is why
two of them read as they do. A half marathon is 21.1 km and the longest loop on
the roster is 17.8 km, so The Unexpected Long Run asks for 13. Every road is
measured to one decimal place, so a total of 4.99 km cannot occur on any map
however it is run, and the Strava Tax is instead a hundred metres short of
whatever the level asked for — which is the better joke anyway.

A badge nobody can win is worse than no badge at all: it reads as a bug to the
player and as an achievement to whoever wrote it.

The reverse is a trap of its own. Toilet to Toilet asks for two stops on one
run and looks impossible, because only one map carries two plumbed ones — but
**A Private Bush is a toilet stop**, the joke is entirely in the place name,
and the Thursday map has one of those as well as the Medical Centre Toilet. A
route can take in both and still meet the brief. Counting only the plumbed ones
made a perfectly good badge look unwinnable, which is a misreading of the map
rather than a fact about it.

### What a locked one gives away

Three settings, per badge, in the `reveal` field:

- **teased** — name and hint on show, so there is something to go after.
  *Local Legend*, *Show Off*, *Hills Pay The Bills*.
- **shape** — the drawing only. Intriguing, and not a list.
- **secret** — nothing at all, for the ones whose whole worth is the surprise.
  *You Didn't Even Try, Did You* is not funny in advance.

The cabinet lives behind the trophy button in the header, in a dialog with the
club table, under two tabs. They belong together: both are about the club
rather than about the run in front of you, and neither had a home before. The
cabinet briefly had a line of its own under the objective panel, which was the
wrong place twice over — that panel is about this run, and a second link under
the run book's turned the corner into a list of doors. The book stays there,
because the book really is about this run.

Without a club table configured there is one tab, so there is no tab strip: the
dialog is the cabinet and nothing else.

A badge won is announced in the result panel above the incident report — a
badge you only find by opening a menu has already missed its own arrival. The
usual run wins none and shows nothing.

The drawings are inline SVG in `BadgeSprites.tsx`, in the same flat-fill hand
as the map, and deliberately simpler: at the size a patch is drawn, anything
past three or four shapes turns to mud.

## Playing

- Select a junction joined to the end of your route to add a road.
- Select the junction you just came from to undo that step.
- Roads cannot be reused.
- **Run Route** unlocks once the route has at least one road and closes the
  loop back at the Observatory.
- **Reset Route** clears everything.
- Tapping a route in **the book** lays it back on the map, ready to run again
  or to edit.
- **Level _n_** in the header opens the fixture list: completed runs, the one
  you are on, and what it takes to open the rest.

### How to play

The screen a first visit opens on, and the one under the **?** after that. Two
columns where there is room — the countryside and its signpost on one side,
five rule cards on the other — and on a phone the rules take the width and the
picture becomes a strip along the top framed on the signpost, because the rules
are the point and the picture is the part that can afford to shrink.

Five cards, as drawn. The screen is a designed thing rather than a list to be
added to: everything else a player needs to know has the whole rest of the game
to say it in, and the objective panel says most of it while they plan.

Three of the five drawings are inline SVG in `RulesIcons.tsx`, in the same hand
as the badges. Two — the pointer and the pair of route pins — are drawn art
instead, and come through the same square with `object-fit: contain`, because
one of them is tall and the other is wide and neither should be stretched into
a shape it was not drawn in. A rule does not know which kind it got.

The bar along the bottom is pinned, for the same reason every other dialog's
actions are: the screen is taller than a phone, and the way out should not go
over the fold with the rest of it.

### The X, and where it lives

Every dialog has one, and `Dialog.tsx` is why: the shell draws it, so a dialog
gets a way out by existing rather than by remembering to grow one. It started
as this screen's own button, which is how the other five came to have no way
out but an action at the bottom of a page you might have to scroll to reach.

It is **sticky in a row of no height**, not absolutely positioned. A dialog is
its own scrolling box, so absolute would pin the X to the top of the *content*
and let it scroll away — on the privacy policy, which is nearly twice the
height of a phone, that is precisely where somebody would go looking for it.
Zero height keeps it out of the flow, so it floats over the corner as drawn.

`closeLabel` is required rather than defaulted to "Close", because six buttons
all called Close have named none of them: a screen reader hears "Close the
book", "Close the fixture list", "Close how to play".

Only one bottom button was made redundant by it — the fixture list's, which
said "Close" and nothing else. The rest say something ("Back to the map",
"Fair enough", "Right, off we go"), and a sentence is not the same offer as a
corner X, so they stay.

Doing this turned up a bug in the rules screen itself. It set `overflow:
hidden` to keep the countryside inside the rounded corner, which took the
vertical scroll with it — so on a short screen the card was simply cut off and
the fifth rule could not be reached at all. It is `overflow-x` now. The corner
is still clipped; the page can be read.

It arrives rather than appears. The card lands, the five rules deal themselves
out from the picture's side one after another, the pigeon walks on, and the tip
comes in last, because the last thing to move is the thing you look at. All of
it is CSS keyframes, so `prefers-reduced-motion` switches the lot off without
any of it knowing.

Nothing starts on the first frame, and nothing is quick. The first draft was
over in a second and began the instant the dialog mounted, which on a first
visit is while the page is still being painted: by the time anybody looked up
it had already happened, and an entrance nobody sees is just a thing that was
already there. So the card waits a fifth of a second before it moves, each card
travels far enough to be seen going, and the whole sequence takes a little over
two seconds end to end — the shout at the finish included. Small and fast reads
as a flicker, which is the worst of both.

That block now zeroes the animation *delay* as well as the duration. A stagger
that keeps only its duration is not a stagger that has been turned off: it is a
row of things popping into existence a tenth of a second apart, which is the
animation, arrived at by a different road.

The tip is a rotation rather than a draw, in `src/game/tips.ts`. A random pick
would show the same line twice running often enough to look broken — and the
whole point of changing it is that somebody notices it changed. So the roll
only chooses where the rotation starts and every step after it is on by one:
never a repeat, and a full turn is every tip exactly once. Nothing is stored,
so a reload starts somewhere new.

It turns while the screen is up, every four and a half seconds, and not only
between visits. Between visits was the first attempt and it was the wrong
answer to the same question: somebody who opens the screen once — which is most
people, because it opens itself — sat there and watched one joke never change.
A rotation nobody is around for is not a rotation.

That is also why there are two dozen of them rather than a handful: at four and
a half seconds each, a short list comes round in front of anybody who reads the
rules properly, and a joke you have already seen is worse than no joke. Two
dozen is nearly two minutes. They are seen in an order nobody controls, so each
one has to land on its own — none of them may set up another — and each is held
to sixty characters, which is the two lines the megaphone's box has on a phone
before the strip starts growing into the rules above it.

That makes it the one piece of this that a timer drives rather than CSS, so it
is the one piece that has to ask about `prefers-reduced-motion` itself. It
does, through the same hook the map uses, and holds on a single tip when the
answer is yes — which doubles as the way out for anybody who needs the line to
stay still long enough to read it.

Everything is keyboard reachable: the junctions are real HTML buttons laid over
the map, so `Tab` and `Enter` work as you would expect, and each announces
whether it is currently selectable. `prefers-reduced-motion` shortens playback
and stops the bouncing and flapping.

### On a phone, turn it sideways

Every map is 800×560, and a phone held upright is the wrong shape for one. The
map is sized by the width of the screen, so in portrait it is stuck at 336×235
on a 375px phone *however much vertical room is going spare* — measured
identically on a 667px screen and an 812px one. Tidying the page around it,
which is worth doing for its own sake, cannot give the map a single pixel.

Turned sideways the screen is the map's own shape, and there is room to put the
controls beside it rather than under it. That is what a landscape phone gets:
the map takes the height, the buttons take a narrow column, the header gives up
its strapline, and the outer padding gives up most of itself. It comes to
439×307 on a 667×375 screen and 460×322 on an 844×390 one — about 1.7 to 1.9
times the area of portrait, with the labels legible at last. A quiet line under
the map in portrait says so.

Two details it is easy to get wrong. The map is sized from the height and the
aspect ratio, and it has to be the *stage* that is sized rather than the SVG:
the junction buttons are positioned `inset: 0` against the stage, so a stage
wider than the drawing leaves every button off its junction. And the rules are
scoped by height rather than width, so they catch phones without catching a
tablet in landscape or a short desktop window.

## Things you can press

Some of the scenery answers back (#104). Press A Private Bush and a pigeon
comes out of it; press the aeroplane at Hecking Airport and it finally takes
off; press the cat and it has had enough and leaves. Twelve of them, across
nine maps.

Two rules hold the whole idea up, and both are the issue's own. Each one fires
**once**, so the pleasure is in finding one rather than in poking it — the
Atlantic Wall is the single exception, taking three presses, a puff of dust
each time and a chunk out of it on the last. And **none of them score**.
Nothing in `src/game/eggs.ts` touches the route, the run book or the scoring,
and it has to stay that way: an egg that moved the total would turn a joke into
a mechanic, and the mechanic would be "press the scenery a lot".

The count is per sprite rather than per kind, which matters on the maps that
have two of something — pressing one of Loopy's two cats leaves the other
exactly where it was. It is held in `RouteMap`, keyed by level and then by the
egg's own id, and it is deliberately not persisted. A gnome remembered across
visits is a save file for a joke.

Almost all of it is one CSS animation hung off `.egg.is-hatched`, with the
sprite's own class picking which. Four needed something drawing that was not
there before, and all four sit at nought opacity until pressed so the sprite
still looks like itself: a lid for the moon, a pigeon behind the bush, somebody
in the portaloo, and a notch out of the wall. The notch has to *be* the hole
rather than a chunk drawn over the top — the concrete is one path, so a piece
painted in its own colour and taken away again would leave precisely what was
there before.

### The two that are not just an animation

**The running track** on Loopy sends three runners from somebody else's club —
red, white and emerald green — round the Hockey Loop circuit three times, with
a shout of AFD! beside the track for as long as they are out. They run on a
path of their own built from the map's own roads, and the shout is one CSS
animation whose duration the component hands to the stylesheet as a custom
property, so retiming a lap cannot leave the word hanging about after they have
gone.

**The gnome** is the only egg that does not stay where it is put. There is
exactly one in the game, he is in no level's `scatter`, and every press sends
him to a different unlocked map — which is why he is state rather than data. A
gnome written into a level would be a gnome on every level at once.

Where he lands is the interesting part. `gnomeSpots` walks a map on a
twelve-unit grid and rejects anywhere within reach of a road, a junction, a
junction's landmark, another piece of scenery, the theme's own trees or any
name on the paper — the issue asks for "never on the roads or behind other
SVGs" and that is the whole rule. The label maths it needs is the same maths
`scenery.test.ts` uses to keep hand-placed scenery off the writing, so it moved
into `landmarks.ts` where both can share it rather than drifting apart.

`nextGnomeHome` takes a roll in [0, 1) rather than calling `Math.random`
itself, which keeps it pure and lets `eggs.test.ts` say exactly where he ends
up. That test walks every map and asserts every candidate spot is clear.

### What they are not

They are a pointer affordance and nothing else: mouse and touch, `aria-hidden`
like the rest of the furniture, and absent from the tab order. That is only
defensible because nothing depends on finding one — there is no badge for it
and no score in it. The egg hunt in the issue's trophy-cabinet note is
deliberately not built: the moment an egg is worth something, a keyboard player
is locked out of it and the whole approach needs rethinking.

One thing did have to change to let any of this work. `.junction-buttons` is a
layer over the whole map, so it was swallowing every press that landed between
two junctions. It is `pointer-events: none` now, with the buttons themselves
put back to `auto` — nothing in the SVG had ever needed a press before, so it
had never shown.

## Music

The main theme loops behind the game, off until the speaker button in the
header is pressed. That choice is remembered, but browsers will not autoplay
audio on a fresh page load, so a returning player's music starts on their next
click or key press rather than failing silently.

`useMusic` takes the track as an argument, which is how the Spooky Run and the
Christmas Run get their own: the level names a file in `public/audio` and the
hook swaps the audio without disturbing the on/off preference. Changing level
mid-track changes the music and keeps playing.

## Development

```bash
npm install
npm run dev      # local dev server
npm run test     # Vitest — pure route logic
npm run build    # type-check and production build
npm run lint     # oxlint, as shipped by the Vite template
```

## Project layout

```text
src/
  components/    presentation: map, sprites, panels, controls
  data/          level content only, no behaviour
  game/          pure rules: graph, evaluation, result selection, progression
  hooks/         reduced motion, playback, music, saved progress
public/
  audio/         music, served as-is
  sprites/       the few bitmap landmarks
```

The rules in `src/game/` know nothing about React. Route playback writes
positions straight to the DOM through refs, so the animation does not push
sixty renders a second through React. Level content is declarative enough that
a second level is a new object in `src/data/`, not a rewrite.

## Tests

`src/game/routeLogic.test.ts` covers distance totals, bidirectional roads,
canal detection, the closed road, pigeon exposure, repeated roads, undo, the
Run Route gate, and deterministic result selection — with fixtures for a
perfect route, one too short, one too long, one through the closure, and one
overrun by pigeons.

`trailLevel.test.ts`, `tilfordLevel.test.ts`, `spookyLevel.test.ts`,
`hawleyLevel.test.ts`, `christmasLevel.test.ts`, `thursleyLevel.test.ts`,
`nightLevel.test.ts`, `frenshamLevel.test.ts` and `farnboroughLevel.test.ts` do
the same for levels 2, 6, 7, 8, 9, 10, 11, 12 and 13 against their own maps.
Most of them end by walking every route out of the start and back, so each
level is held to exactly its winners. A road whose distance drifts takes the
count with it and fails.

`nightLevel.test.ts`, `frenshamLevel.test.ts` and `farnboroughLevel.test.ts`
each walk their map a second
time to check that every junction on it is on at least one winning route. That
is a rule for those two maps rather than for the roster — Tilford's Village Shop and Thursley's Elstead
Green are deliberately out of reach and better for it — but the Thursday Night
Run was not meant to have any, and one draft of it had three.

`farnboroughLevel.test.ts` also covers the badge that comes with it, and the
case worth covering is the one a level badge fails at: a run that missed the
brief is logged in the book exactly like a winner, so the test asks whether the
race was *won* rather than whether it happened.

That file also pins the level to daylight: `mood`, `flock` and `music` all
unset. It is the one assertion here that is about restraint rather than
correctness, and it is there because the first draft reached for the Halloween
kit for a level that is simply a Thursday.

Those walks count *journeys* — every way round, in every order — which is a
larger number than the routes the game counts, and deliberately so: it is the
stricter check of the two, and a level whose journeys move has certainly
changed. The number a player actually sees is the deduplicated one, and every
level's is pinned in `scoring.test.ts` as `[9, 2, 2, 8, 3, 4, 4, 4, 7, 6, 5, 6, 4]`. Both
are asserted, because a change that moves one and not the other is exactly the
kind of thing worth being stopped by.

The Christmas Run got there first, and is why the rest now do it. An earlier
draft of that level looked like fourteen winners and was really two, because
twelve of them were one figure-eight relaid in a different order — a
distinction the journey count cannot see and the fixture list very much can.
Counting by the set of roads, the way the club's book does, is what caught it.

Nothing on the roster is a figure-eight now; that draft was redesigned away.
The two counts still disagree everywhere, though, because a loop run backwards
is two journeys and one route, which is why both are worth pinning.

`src/game/scenery.test.ts` keeps the hand-placed scenery off the roads, the
junctions and the writing. Every sprite it checks was positioned by working out
where the roads went on paper, and the mistakes that made were invisible until
you zoomed in — it caught a tree standing in the lane down to The Sandy Bit
that had been shipped two releases earlier.

For a long time it measured the wrong thing, which is issue #110. A sprite is
placed by a point and drawn *around* it, and the point was all anything
checked — so a landmark could clear every threshold in the file by a
comfortable margin and still be sitting squarely on a road. Pyestock Wood
cleared by 20.5 against a limit of 18 and lay along the tarmac, because a wood
is sixty units wide. Seven of those shipped, one at a time, each found by
somebody looking at the map.

Two things fixed it. **`LANDMARK_BOX` and `SCATTER_BOX`** in `landmarks.ts`
give every drawing its real extent, and those numbers were *measured* rather
than estimated: a throwaway page rendered one junction of every type and one of
every scatter kind through the app's own lookup tables, and `getBoundingClientRect`
was read off each. That mattered more than it sounds — a table of eyeballed
half-widths would have been wrong in exactly the cases that caused the bug,
because the sprites nobody thinks of as big are the ones that are.

The second is **what gets measured**. Asking how far a box sits from a road
flags a third of the roster, because a box is a crude stand-in for a triangle
or a cottage and its corners are mostly empty paper. Asking how far the road
gets *inside* the box does not, and it matches what a person actually sees: a
road grazing a corner is fine and is everywhere, a road running through the
middle of a sprite is wrong and is rare. The three thresholds were then read
off a ranking of every drawing on the roster, and each sits in a gap in it —
the deepest graze anybody shipped on purpose is 2.8 and the shallowest real
clash is 7.2.

The rewrite found four more instances immediately, all of them shipped and all
of them invisible to the old file: the Village Shop at Tilford drawn twenty
units into one of the theme's own trees, The Woods at Fleet Pond and the Three
Horseshoes at Thursley doing the same, and a lane running ten units through
Wharf Copse on the Thursday Night Run.

It also closed the other half of #110. A `park` junction scatters three trees
around itself and **nothing checked them at all** — the test knew about
`TRAIL_TREES` and had never heard of `PARK_TREES`, across the seven levels that
have a park. That is how the supporters at Cove Green came to be placed
squarely behind one with the suite perfectly happy. Both lists now live in
`landmarks.ts` and the drawing imports them from there, so they cannot drift.

The gnome had the same hole and now does not: `gnomeSpots` knew about the
theme's trees and not a park's, so he could be sent to stand behind one on any
of those seven maps. He still gets a point test rather than a box, and that is
deliberate — he is eight units across, so for him a point *is* the drawing.

`src/game/pace.test.ts` covers the hills. The group drops to a little over half
pace on a climb and makes it up on the flat, so a run still takes the same
eight seconds whatever the route; what changes is where the time goes.

`src/game/progression.test.ts` covers the unlock rules against a stub roster:
the first level always open, later ones shut until their predecessor is done,
no skipping ahead, and a completed level staying open through a reorder.

`src/game/tips.test.ts` holds the how-to-play tip to being a rotation: it walks
a full turn of it and asserts that no tip follows itself and that one turn is
every tip exactly once. It also holds each one to sixty characters, so a tip
long enough to grow the strip it lives in fails rather than ships. The joke is
not testable; that it changes, and that it fits, are.

## The club table

Off by default: with no Supabase project configured, `clubTableEnabled` folds
to `false` at build time, no leaderboard appears, and nothing is ever fetched.
The game is then exactly what it was before any of it existed — local, private,
and perfectly playable. A missing key is not an outage.

Either way it costs about 2 kB on the initial load. The Supabase client lives in
a separate 54 kB chunk behind a dynamic import, fetched the first time somebody
opens the table or submits a run — which most people never will, and nobody
does on a first visit. That chunk is built whether or not a project is
configured; it is simply never asked for.

**Nothing is trusted from the client.** A submission is a level id and a list
of road ids — there is no score in it to have been edited. The `submit-run`
edge function replays that route through the game's own `scoreRun` and stores
what it actually comes to. So the server and the client cannot disagree, and
rebalancing the scoring rescores everyone's history rather than stranding it.

That sharing of code is the one awkward corner. The app's imports are
extensionless and Deno insists on extensions, so the function cannot import
`src/game` directly. `npm run build:club` bundles the shared surface —
`src/club/gameSurface.ts` — into `supabase/functions/_shared/game.bundle.js`
with rolldown, which Vite already ships. The bundle is committed and can
therefore go stale: regenerate it whenever the scoring or the level data
changes, and guard it in CI before this goes anywhere serious.

Row level security is the whole security model, and it is worth reading
`supabase/migrations/0001_club_table.sql` for the reasoning. Briefly: everyone
may read the table; you may write and rename and *delete* your own player row;
and nobody may write a submission at all, because a points column cannot be
trusted to its own author. Players are Supabase anonymous users — a real
`auth.uid()` with no login screen — which is what makes any of that mean
something, since an id in a column is one anybody could type.

Deleting your own player row cascades your runs away, and `delete-me` also
removes the anonymous auth user, because that id *is* the device-scoped
identifier the privacy policy promises to remove.

### Setting it up

1. Create a Supabase project in the EU. Enable the Data API, turn
   **off** "automatically expose new tables", and turn **on** automatic RLS.
   The migration grants privileges by hand precisely because of the second one.
2. Run `supabase/migrations/0001_club_table.sql` against it.
3. Enable anonymous sign-ins in Authentication → Providers.
4. `npm run build:club`, then deploy both functions:
   `supabase functions deploy submit-run delete-me`.
5. Copy `.env.example` to `.env.local` with the project URL and anon key, and
   add the same two as repository secrets wired into the build in
   `deploy.yml`. The service role key stays out of all of this — Supabase sets
   it in the functions' own environment.

## Deployment

Hosted on GitHub Pages at **https://runners.sillygame.studio**.

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
Tests, lint and the type-checked build all run first, so a red test stops the
deploy rather than shipping.

The custom domain lives in `public/CNAME`, which Vite copies into `dist` on
every build — without it Pages drops the domain each time it republishes.
Because the site is served from the root of its own domain, Vite's `base`
stays `/`.

## Licence

Copyright © 2026 Jo Hutchins-Joss / Silly Game Studio.

The **code** is MIT — see [LICENSE](LICENSE). Fork it, learn from it, build on
it.

The **music and artwork** are not. All rights reserved: the tracks in
`public/audio`, the bitmaps in `public/sprites`, the favicon, and the drawn
sprites in `src/components/MapSprites.tsx` stay mine. See
[LICENSE-ASSETS.md](LICENSE-ASSETS.md) for what that means in practice —
briefly, fork the code and bring your own art, or ask.

The sprites are the awkward case, being drawings written as code. The file is
MIT as code; the drawings in it are not free to lift into something else.
