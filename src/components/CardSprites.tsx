import type { ReactNode } from "react";

/**
 * The drawings on the briefing cards (#10), in the same hand as the badges.
 *
 * Flat fills over ink, the club palette, no gradients, and drawn in the same
 * -30..30 box so a card can size them all the same way. Deliberately simple
 * for the same reason the badges are: at the size a card is dealt, a drawing
 * with more than three or four shapes in it turns to mud.
 *
 * Where a badge has already drawn the thing — a mug, a watch, a bird, a hill
 * — this reuses its classes rather than inventing a second version of it. A
 * player who has seen a pigeon on the trophy wall should recognise the one on
 * the card without being told they are the same bird.
 */

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg className="card__art" viewBox="-30 -30 60 60" aria-hidden="true">
      {children}
    </svg>
  );
}

/** Ben's hills, and the only direction Ben is interested in. */
export function BenCard() {
  return (
    <Frame>
      <path d="M -24 16 L -6 -8 L 4 6 L 14 -10 L 24 16 Z" className="badge-hill" />
      <path d="M 0 -14 L 8 -22 L 16 -14" className="card-arrow" />
      <path d="M 8 -22 L 8 -2" className="card-arrow" />
    </Frame>
  );
}

/**
 * Dan's cows. Dan is not going home until he has said hello.
 *
 * The cow off the map, not a drawing of one — the same call `CowBadge` made,
 * for the same reason: a vector cow at this size is a blob with spots on.
 * Same file, same animal.
 */
export function DanCard() {
  return (
    <Frame>
      <image
        href={`${import.meta.env.BASE_URL}sprites/cow.png`}
        x={-28}
        y={-17}
        width={56}
        height={34}
      />
    </Frame>
  );
}

/** Nobody volunteered: a signpost with nothing written on it. */
export function NobodyCard() {
  return (
    <Frame>
      <rect x={-2.5} y={-8} width={5} height={30} className="badge-post" />
      <rect x={-22} y={-20} width={26} height={11} rx={2} className="card-board" />
      <rect x={-2} y={-4} width={24} height={11} rx={2} className="card-board" />
    </Frame>
  );
}

/** The shoes. They are white, and they are staying white. */
export function NewShoesCard() {
  return (
    <Frame>
      <path
        d="M -22 4 L -22 -6 Q -14 -8 -8 -2 L 4 6 L 20 8 Q 24 9 24 13 L 24 16 L -22 16 Z"
        className="card-shoe"
      />
      <path d="M -22 12 L 24 12" className="card-shoe-sole" />
      <ellipse cx={-6} cy={21} rx={16} ry={5} className="card-mud" />
    </Frame>
  );
}

/**
 * The goose off the map, struck through. The same animal the player has met
 * at the pond, for the same reason the cow is a bitmap.
 */
export function GeeseCard() {
  return (
    <Frame>
      <image
        href={`${import.meta.env.BASE_URL}sprites/goose.png`}
        x={-24}
        y={-26}
        width={48}
        height={48}
      />
      <path d="M -21 20 L 21 -16" className="badge-strike" />
    </Frame>
  );
}

/** The large coffee, and its consequences. */
export function BigCoffeeCard() {
  return (
    <Frame>
      <path
        d="M -14 -2 L -11 18 Q -10 22 -6 22 L 6 22 Q 10 22 11 18 L 14 -2 Z"
        className="badge-mug"
      />
      <path d="M 14 2 Q 23 3 22 9 Q 21 14 13 14" className="badge-mug-handle" />
      <path d="M -6 -10 Q -2 -15 -6 -20 M 6 -10 Q 10 -15 6 -20" className="badge-steam" />
    </Frame>
  );
}

/** The hills, struck through, by somebody whose legs have had enough. */
export function HillSessionCard() {
  return (
    <Frame>
      <path d="M -24 14 L -6 -10 L 4 4 L 14 -12 L 24 14 Z" className="badge-hill" />
      <path d="M -21 20 L 21 -18" className="badge-strike" />
    </Frame>
  );
}

/**
 * The birds, as a flock rather than one of them — this is the card about all
 * of them at once, and the single struck-through bird is the goose's.
 */
export function BirdsCard() {
  return (
    <Frame>
      <path
        d="M -22 -6 q 6 -7 12 0 q 6 -7 12 0"
        className="card-bird"
      />
      <path d="M -6 6 q 5 -6 10 0 q 5 -6 10 0" className="card-bird" />
      <path d="M -20 16 q 4 -5 8 0 q 4 -5 8 0" className="card-bird" />
    </Frame>
  );
}

/** Priya's traffic lights, on red, as they always are. */
export function CarefulCard() {
  return (
    <Frame>
      <path d="M 0 26 v -14" className="card-lights-post" />
      <rect x={-11} y={-26} width={22} height={40} rx={5} className="card-lights-box" />
      <circle cx={0} cy={-17} r={5} className="card-lights-stop" />
      <circle cx={0} cy={-6} r={5} className="card-lights-off" />
      <circle cx={0} cy={5} r={5} className="card-lights-off" />
    </Frame>
  );
}

/** The watch that did not start. As far as the internet goes, this never happened. */
export function WatchCard() {
  return (
    <Frame>
      <rect x={-15} y={-15} width={30} height={30} rx={7} className="badge-watch" />
      <circle cx={0} cy={0} r={10} className="badge-watch-face" />
      {/* Both hands at twelve: nothing has moved. */}
      <path d="M 0 0 L 0 -7" className="badge-hands" />
      <path d="M -21 20 L 21 -20" className="badge-strike" />
    </Frame>
  );
}

/** Rain. Nobody wants to be out in this. */
export function RainCard() {
  return (
    <Frame>
      <path
        d="M -18 -2 Q -22 -12 -12 -14 Q -9 -22 0 -21 Q 10 -21 12 -13 Q 22 -12 19 -2 Z"
        className="card-cloud"
      />
      <path d="M -11 4 L -14 15 M 1 4 L -2 15 M 13 4 L 10 15" className="card-rain" />
    </Frame>
  );
}

/** A perfect evening. Nobody can think of a single complaint. */
export function PerfectCard() {
  return (
    <Frame>
      <circle cx={0} cy={0} r={12} className="card-sun" />
      <path
        d="M 0 -20 L 0 -26 M 0 20 L 0 26 M -20 0 L -26 0 M 20 0 L 26 0 M -14 -14 L -19 -19 M 14 14 L 19 19 M -14 14 L -19 19 M 14 -14 L 19 -19"
        className="card-ray"
      />
    </Frame>
  );
}

/**
 * Roo's camera, mid-flash. The body is deliberately plain so the burst off
 * the top of it is the thing you see, which is also the thing the card does.
 */
export function RooCard() {
  return (
    <Frame>
      <path
        d="M -13 -13 l 4 -6 h 12 l 4 6"
        className="card-camera-hood"
      />
      <rect
        x={-22}
        y={-13}
        width={44}
        height={30}
        rx={5}
        className="card-camera"
      />
      <circle cx={0} cy={2} r={9} className="card-lens" />
      <circle cx={0} cy={2} r={4} className="card-lens-glass" />
      <rect x={11} y={-9} width={8} height={5} rx={1.5} className="card-bulb" />
      <path
        d="M 15 -20 v -6 M 8 -18 l -3 -5 M 23 -18 l 3 -5"
        className="card-spark"
      />
    </Frame>
  );
}

/**
 * Nobody navigating: the route as a straight dash from A to B, and the line
 * the group actually takes wandering all over it. The joke is the gap
 * between the two, so both have to be on the card.
 */
export function LostCard() {
  return (
    <Frame>
      <path d="M -22 18 L 22 -16" className="card-plan" />
      <path
        d="M -22 18 Q -6 20 -8 6 Q -10 -8 4 -4 Q 18 0 10 -12 Q 6 -18 22 -16"
        className="card-astray"
      />
      <circle cx={-22} cy={18} r={3.4} className="card-pin" />
      <circle cx={22} cy={-16} r={3.4} className="card-pin" />
    </Frame>
  );
}

/**
 * Snow: the flakes off the map, at card size. Three sizes rather than one,
 * because snow drawn all one size reads as spots on the paper.
 */
export function SnowCard() {
  return (
    <Frame>
      <circle cx={-14} cy={-16} r={4} className="card-flake" />
      <circle cx={6} cy={-20} r={2.6} className="card-flake" />
      <circle cx={17} cy={-6} r={3.4} className="card-flake" />
      <circle cx={-6} cy={-2} r={3} className="card-flake" />
      <circle cx={-20} cy={6} r={2.4} className="card-flake" />
      <circle cx={9} cy={9} r={4} className="card-flake" />
      {/* The ground it has settled on, which is what stops it. */}
      <path d="M -24 20 Q -10 13 2 19 Q 14 25 24 18 L 24 26 L -24 26 Z" className="card-drift" />
    </Frame>
  );
}

/** The marathon crowd: a long way, and a long way to go. */
export function MarathonCard() {
  return (
    <Frame>
      <path d="M -24 12 L 24 12" className="card-longline" />
      <path d="M -24 12 L -24 4 M 24 12 L 24 4" className="card-longline" />
      <path d="M -6 -6 L 6 -6 M 0 -12 L 6 -6 L 0 0" className="card-arrow" />
    </Frame>
  );
}

/**
 * Fog: banks stacked back to front, each one fainter than the last. There is
 * nothing else on the card, because on the day there is nothing else to see.
 */
export function FogCard() {
  return (
    <Frame>
      <ellipse cx={2} cy={-14} rx={20} ry={5} className="card-fog-far" />
      <ellipse cx={-6} cy={-2} rx={26} ry={6} className="card-fog-mid" />
      <ellipse cx={4} cy={11} rx={24} ry={7} className="card-fog-near" />
    </Frame>
  );
}

/**
 * A following wind: three lines going the way you are, the middle one
 * curling. Nothing but movement, because that is the whole of the card.
 */
export function WindCard() {
  return (
    <Frame>
      <path
        d="M -22 -10 L 6 -10 Q 16 -10 16 -17 Q 16 -23 9 -22"
        className="card-gust"
      />
      <path d="M -22 0 L 14 0 Q 24 0 24 6 Q 24 12 17 11" className="card-gust" />
      <path d="M -22 10 L 2 10" className="card-gust" />
    </Frame>
  );
}
