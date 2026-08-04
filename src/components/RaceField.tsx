import type { RefObject } from "react";
import { Runner } from "./MapSprites";
import type { FieldPlace } from "../game/raceField";

/**
 * Everybody else in a race (#111). Eight vests that are nobody's here — the
 * club's own blue and green are conspicuously not among them, because the one
 * thing the field has to do is make five runners findable inside it.
 *
 * The list can grow or shrink without telling anybody: `raceField` hands over a
 * fraction rather than an index, so the length of this array is the only thing
 * that knows how many colours there are.
 */
const FIELD_VESTS = [
  "vest-red",
  "vest-emerald",
  "vest-amber",
  "vest-violet",
  "vest-slate",
  "vest-pink",
  "vest-gold",
  "vest-lime",
];

const vestFor = (fraction: number) =>
  FIELD_VESTS[Math.min(FIELD_VESTS.length - 1, Math.floor(fraction * FIELD_VESTS.length))];

interface Props {
  /** Where each of them runs, from `raceField`. Empty on a level that is not a race. */
  field: FieldPlace[];
  fieldRef: RefObject<(SVGGElement | null)[]>;
}

/**
 * Everybody else in the race, parked at the origin until the animation moves
 * them, exactly as the club's own five are. Drawn underneath the club, so that
 * whatever else the pack is doing the blue vests stay readable.
 */
export function RaceField({ field, fieldRef }: Props) {
  return (
    <g aria-hidden="true">
      {field.map((place, index) => (
        <g
          key={index}
          opacity={0}
          ref={(element) => {
            if (fieldRef.current) fieldRef.current[index] = element;
          }}
        >
          <Runner index={index} vest={vestFor(place.vest)} />
        </g>
      ))}
    </g>
  );
}
