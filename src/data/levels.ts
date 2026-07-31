import { sundayTrailRun } from "./sundayTrailRun";
import { thursdaySocialRun } from "./thursdaySocialRun";
import type { Level } from "../game/types";

/** Every level, in the order they are offered. */
export const levels: Level[] = [thursdaySocialRun, sundayTrailRun];
