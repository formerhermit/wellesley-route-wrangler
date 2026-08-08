import {
  ChristmasBadge,
  ClosedRoadBadge,
  CowBadge,
  ExactlyFiveBadge,
  GooseBadge,
  HillsBadge,
  IgnoredSignBadge,
  LocalLegendBadge,
  LongRunBadge,
  NewShoesBadge,
  NoHillsBadge,
  PappedBadge,
  PigeonBadge,
  PortalooBadge,
  ShortRunBadge,
  ShowOffBadge,
  SpookyBadge,
  StravaTaxBadge,
  ToiletBadge,
} from "./BadgeSprites";

/**
 * Which drawing goes with which badge. Its own file so `BadgeSprites` exports
 * nothing but components, which is what fast refresh wants.
 */
export const BADGE_ART: Record<string, () => React.JSX.Element> = {
  "exactly-five": ExactlyFiveBadge,
  "strava-tax": StravaTaxBadge,
  "no-hills": NoHillsBadge,
  "pigeon-diplomat": PigeonBadge,
  "didnt-even-try": ShortRunBadge,
  "hills-pay-the-bills": HillsBadge,
  "closed-means-closed": ClosedRoadBadge,
  "reading-isnt-your-thing": IgnoredSignBadge,
  "unexpected-long-run": LongRunBadge,
  "show-off": ShowOffBadge,
  "local-legend": LocalLegendBadge,
  "obsessed-with-cows": CowBadge,
  spooker: SpookyBadge,
  "is-someone-jingling": ChristmasBadge,
  "brave-little-soldier": PortalooBadge,
  "toilet-to-toilet": ToiletBadge,
  "goose-botherer": GooseBadge,
  "new-shoes": NewShoesBadge,
  papped: PappedBadge,
};
