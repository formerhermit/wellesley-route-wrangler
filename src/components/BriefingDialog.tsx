import { useState } from "react";
import { Dialog } from "./Dialog";
import { CARD_ART } from "./cardArt";
import type { Card, Hand } from "../game/cards";

interface Props {
  /** The hand on the table, once one has been dealt. */
  hand: Hand | undefined;
  /** Deals one, when the player asks. Owned above, so it survives a close. */
  onDeal: () => void;
  /** The two the player kept. Nothing happens until both are chosen. */
  onConfirm: (picked: Card[]) => void;
  onClose: () => void;
}

const KEEP = 2;

/**
 * The briefing (#10): what the club has turned up with, and which two of it
 * you are taking out with you.
 *
 * It opens on the offer rather than on the hand: a dialog that deals as it
 * appears reads as a menu that was already populated, with the one moment
 * that is actually the player's having happened off screen. So there is a
 * button, and the cards land when it is pressed.
 *
 * The hand itself belongs to the caller. Kept here it would be thrown away
 * every time this closed, and a hand you can drop by pressing Escape is a
 * hand you can reroll (#132).
 *
 * Three cards, one of each suit, and you keep two. The suits are what stop
 * two rules of a kind ever meeting, and the hand was checked before it was
 * dealt, so every pair on this screen is a run somebody could actually
 * finish — there is no such thing here as a card that greys out when you
 * reach for it. There is no redeal either: the next briefing comes after the
 * run report.
 */
export function BriefingDialog({ hand, onDeal, onConfirm, onClose }: Props) {
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

  const chosen = hand ? hand.filter((card) => picked.includes(card.id)) : [];
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
        Choose your run
      </h2>
      <p id="briefing-lead" className="dialog__lead">
        Three turn up. You take two of them out with you.
      </p>

      {hand ? (
        <>
          <ul className="briefing__hand">
            {hand.map((card, index) => {
              const Art = CARD_ART[card.id];
              const on = picked.includes(card.id);
              return (
                <li key={card.id}>
                  <button
                    type="button"
                    className={`briefing-card${on ? " is-picked" : ""}`}
                    aria-pressed={on}
                    /* Its place in the queue, so they land one after another
                       rather than all at once. */
                    style={
                      { "--deal": `${index * 150}ms` } as React.CSSProperties
                    }
                    onClick={() => toggle(card)}
                  >
                    <span className="briefing-card__suit">{card.suit}</span>
                    <span className="briefing-card__patch">
                      {Art ? <Art /> : null}
                    </span>
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
          <p className="dialog__actions-hint">No redeal.</p>
        </>
      ) : (
        <div className="dialog__actions">
          <button
            type="button"
            className="button button--primary briefing__deal"
            onClick={onDeal}
          >
            Deal the cards
          </button>
        </div>
      )}
    </Dialog>
  );
}
