import { caesarsCamp } from "./caesarsCamp";
import { fleetPondRun } from "./fleetPondRun";
import { hawleyLake } from "./hawleyLake";
import { loopyRun } from "./loopyRun";
import { spookyRun } from "./spookyRun";
import { thursdaySocialRun } from "./thursdaySocialRun";
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
];
