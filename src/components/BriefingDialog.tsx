import { useState } from "react";
import { Dialog } from "./Dialog";
import { CARD_ART } from "./cardArt";
import { SUITS } from "../game/cards";
import type { Card, Hand } from "../game/cards";
import type { Level } from "../game/types";

interface Props {
  /** The map the hand was dealt for: a card's rule line can depend on it. */
  level: Level;
  /** The hand on the table. Dealt by the caller on the way in. */
  hand: Hand | undefined;
  /** The two the player kept. Nothing happens until both are chosen. */
  onConfirm: (picked: Card[]) => void;
  onClose: () => void;
}

const KEEP = 2;

/**
 * The briefing (#10): what the club has turned up with, and which two of it
 * you are taking out with you.
 *
 * The hand is on the table when the dialog opens — dealt by the caller on
 * the way in, still landing card by card. The only decision this screen
 * holds is the pick, so the pick is the only button on it: one that counts
 * the choice down and becomes the confirm when the choice is made, because
 * a disabled "off we go" with nothing saying why reads as a button that
 * does not work (#136).
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
export function BriefingDialog({ level, hand, onConfirm, onClose }: Props) {
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

      <ul className="briefing__hand">
        {SUITS.map((suit, index) => {
          const card = hand?.[index];
          if (!card) {
            return (
              <li key={suit}>
                <span className="briefing-card briefing-card--empty">
                  <span className="briefing-card__suit">{suit}</span>
                </span>
              </li>
            );
          }
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
                style={{ "--deal": `${index * 150}ms` } as React.CSSProperties}
                onClick={() => toggle(card)}
              >
                <span className="briefing-card__suit">{card.suit}</span>
                <span className="briefing-card__patch">
                  {Art ? <Art /> : null}
                </span>
                <span className="briefing-card__name">{card.name}</span>
                <span className="briefing-card__blurb">{card.blurb}</span>
                {/* The joke above, the small print below: what taking this
                    card actually does to the brief. */}
                <span className="briefing-card__rule">{card.rule(level)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="dialog__actions">
        {/* The label is the state: it says what is still wanted while it is
            wanted, and turns into the confirm the moment it is not. */}
        <button
          type="button"
          className="button button--primary"
          disabled={!ready}
          onClick={() => onConfirm(chosen)}
        >
          {ready
            ? "Right, off we go"
            : chosen.length === 1
              ? "Pick one more"
              : "Pick two"}
        </button>
      </div>
      {hand && <p className="dialog__actions-hint">No redeal.</p>}
    </Dialog>
  );
}
