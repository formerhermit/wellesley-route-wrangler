import { fleetPondRun } from "./fleetPondRun";
import { loopyRun } from "./loopyRun";
import { spookyRun } from "./spookyRun";
import { sundayTrailRun } from "./sundayTrailRun";
import { thursdaySocialRun } from "./thursdaySocialRun";
import { thursdayTownRun } from "./thursdayTownRun";
import { tilfordRun } from "./tilfordRun";
import type { Level } from "../game/types";

/** Every level, in the order they are offered. */
export const levels: Level[] = [
  thursdaySocialRun,
  sundayTrailRun,
  thursdayTownRun,
  fleetPondRun,
  loopyRun,
  tilfordRun,
  spookyRun,
];
