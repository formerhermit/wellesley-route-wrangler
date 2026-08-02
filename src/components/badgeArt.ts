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
  NoHillsBadge,
  PigeonBadge,
  PortalooBadge,
  ShortRunBadge,
  SpookyBadge,
  StravaTaxBadge,
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
  "local-legend": LocalLegendBadge,
  "obsessed-with-cows": CowBadge,
  spooker: SpookyBadge,
  "is-someone-jingling": ChristmasBadge,
  "brave-little-soldier": PortalooBadge,
  "goose-botherer": GooseBadge,
};
