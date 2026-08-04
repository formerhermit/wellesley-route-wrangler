import { caesarsCamp } from "./caesarsCamp";
import { christmasRun } from "./christmasRun";
import { farnboroughHalf } from "./farnboroughHalf";
import { fleetPondRun } from "./fleetPondRun";
import { frenshamPonds } from "./frenshamPonds";
import { hawleyLake } from "./hawleyLake";
import { loopyRun } from "./loopyRun";
import { spookyRun } from "./spookyRun";
import { thursdayNightRun } from "./thursdayNightRun";
import { thursdaySocialRun } from "./thursdaySocialRun";
import { thursleyCommon } from "./thursleyCommon";
import { thursdayTownRun } from "./thursdayTownRun";
import { tilfordRun } from "./tilfordRun";
import type { Level } from "../game/types";

/** Every level, in the order they are offered. */
export const levels: Level[] = [
  thursdaySocialRun,
  caesarsCamp,
  thursdayTownRun,
  fleetPondRun,
  loopyRun,
  tilfordRun,
  spookyRun,
  hawleyLake,
  christmasRun,
  thursleyCommon,
  thursdayNightRun,
  frenshamPonds,
  farnboroughHalf,
];
