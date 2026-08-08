import {
  BenCard,
  BigCoffeeCard,
  DanCard,
  GeeseCard,
  LostCard,
  NewShoesCard,
  NobodyCard,
  PerfectCard,
  RainCard,
  WatchCard,
  WindCard,
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
  "leader-lost": LostCard,
  "runner-new-shoes": NewShoesCard,
  "runner-geese": GeeseCard,
  "runner-big-coffee": BigCoffeeCard,
  "runner-watch": WatchCard,
  "weather-rain": RainCard,
  "weather-perfect": PerfectCard,
  "weather-wind": WindCard,
};
