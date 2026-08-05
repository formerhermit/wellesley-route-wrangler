import {
  BenCard,
  BigCoffeeCard,
  BirdsCard,
  DanCard,
  NewShoesCard,
  NobodyCard,
  PerfectCard,
  RainCard,
  WatchCard,
} from "./CardSprites";
import type { ReactNode } from "react";

/**
 * Which drawing belongs to which card, in its own file so `CardSprites` can
 * stay nothing but components — the same split `badgeArt` already makes.
 */
export const CARD_ART: Record<string, () => ReactNode> = {
  "leader-ben": BenCard,
  "leader-dan": DanCard,
  "leader-nobody": NobodyCard,
  "runner-new-shoes": NewShoesCard,
  "runner-birds": BirdsCard,
  "runner-big-coffee": BigCoffeeCard,
  "runner-watch": WatchCard,
  "weather-rain": RainCard,
  "weather-perfect": PerfectCard,
};
