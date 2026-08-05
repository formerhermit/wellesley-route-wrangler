import { useState } from "react";
import { Dialog } from "./Dialog";
import { CARD_ART } from "./cardArt";
import type { Card, Hand } from "../game/cards";

interface Props {
  hand: Hand;
  /** The two the player kept. Nothing happens until both are chosen. */
  onConfirm: (picked: Card[]) => void;
  onClose: () => void;
}

const KEEP = 2;

/**
 * The briefing (#10): what the club has turned up with, and which two of it
 * you are taking out with you.
 *
 * Three cards, one of each suit, and you keep two. The suits are what stop
 * two rules of a kind ever meeting, and the hand was checked before it was
 * dealt, so every pair on this screen is a run somebody could actually
 * finish — there is no such thing here as a card that greys out when you
 * reach for it.
 *
 * There is no redeal. You get what you get, and the next briefing comes
 * after the run report, not instead of this one.
 */
export function BriefingDialog({ hand, onConfirm, onClose }: Props) {
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (card: Card) => {
    setPicked((current) => {
      if (current.includes(card.id)) {
        return current.filter((id) => id !== card.id);
      }
      // Two is the whole hand, so a third pick pushes the oldest out rather
      // than refusing: changing your mind should not need an undo first.
      return [...current, card.id].slice(-KEEP);
    });
  };

  const chosen = hand.filter((card) => picked.includes(card.id));
  const ready = chosen.length === KEEP;

  return (
    <Dialog
      titleId="briefing-title"
      describedBy="briefing-lead"
      closeLabel="the briefing"
      className="dialog--briefing"
      onClose={onClose}
    >
      <p className="dialog__badge">Briefing</p>
      <h2 id="briefing-title" tabIndex={-1}>
        Who turned up
      </h2>
      <p id="briefing-lead" className="dialog__lead">
        Take two of the three out with you. They change the run, never the
        points.
      </p>

      <ul className="briefing__hand">
        {hand.map((card) => {
          const Art = CARD_ART[card.id];
          const on = picked.includes(card.id);
          return (
            <li key={card.id}>
              <button
                type="button"
                className={`briefing-card${on ? " is-picked" : ""}`}
                aria-pressed={on}
                onClick={() => toggle(card)}
              >
                <span className="briefing-card__suit">{card.suit}</span>
                <span className="briefing-card__patch">{Art ? <Art /> : null}</span>
                <span className="briefing-card__name">{card.name}</span>
                <span className="briefing-card__blurb">{card.blurb}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="dialog__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={!ready}
          onClick={() => onConfirm(chosen)}
        >
          {ready ? "Right, off we go" : `Pick ${KEEP - chosen.length} more`}
        </button>
      </div>
      <p className="dialog__actions-hint">
        No redeal. The next briefing comes after the run report.
      </p>
    </Dialog>
  );
}
