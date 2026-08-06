import { CARD_ART } from "./cardArt";
import type { Card } from "../game/cards";

interface Props {
  cards: Card[];
}

/**
 * What the club turned up with, under the map for as long as it is true
 * (#132).
 *
 * Without it the briefing is a screen you visit once and then have nothing
 * to show for: the objectives it adds are down the page and read like the
 * level's own, so the cards land as two extra rules from nowhere rather than
 * as the two people who came out with you. A run is easier to plan when you
 * can see who is on it.
 */
export function BriefingStrip({ cards }: Props) {
  if (cards.length === 0) return null;

  return (
    <section className="briefing-strip" aria-label="Out with you today">
      <p className="briefing-strip__label">Out with you</p>
      <ul className="briefing-strip__cards">
        {cards.map((card) => {
          const Art = CARD_ART[card.id];
          return (
            <li key={card.id} className="briefing-strip__card">
              <span className="briefing-strip__patch" aria-hidden="true">
                {Art ? <Art /> : null}
              </span>
              <span className="briefing-strip__name">{card.name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
