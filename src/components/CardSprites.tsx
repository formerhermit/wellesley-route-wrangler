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

/** The birds. Not a phobia, they say. */
export function BirdsCard() {
  return (
    <Frame>
      <ellipse cx={-4} cy={2} rx={13} ry={10} className="badge-bird" />
      <circle cx={9} cy={-7} r={6} className="badge-bird" />
      <circle cx={11} cy={-9} r={1.8} className="badge-eye" />
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
