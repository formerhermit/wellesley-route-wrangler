import { useEffect, useState } from "react";
import { Dialog } from "./Dialog";
import {
  EyesIcon,
  MegaphoneIcon,
  PigeonTrail,
  RoutesIcon,
  StartIcon,
  TapIcon,
  TitleSparks,
  TrophyIcon,
} from "./RulesIcons";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Pigeon } from "./Pigeon";
import { nextTipIndex, tips } from "../game/tips";
import type { Level } from "../game/types";

interface Props {
  level: Level;
  onClose: () => void;
}

/**
 * Which tip the screen shouted last time, so the next one is a different one.
 *
 * Module scope rather than state, because the dialog is unmounted between
 * visits and there is nowhere inside it for a memory to live. Nothing is
 * stored: a reload starts the rotation somewhere new, which is the point of
 * the roll. `nextTipIndex` is where the decision actually is, and it is pure.
 *
 * Advancing it from a render is not, so StrictMode steps it on twice per
 * opening in development. Nothing rests on which tip comes up, the shipped
 * build steps once, and a skipped joke is not a bug worth plumbing state
 * through App to avoid.
 */
let lastTip: number | null = null;

/**
 * How long a tip holds the megaphone.
 *
 * Long enough to read twice and short enough that a screen nobody reopens
 * still gets through several: the first version changed the tip only between
 * visits, which meant a player who opened it once saw exactly one joke and no
 * rotation at all.
 */
const TIP_HOLD_MS = 4500;

/**
 * The rules, one to a card, in the order somebody meets them: where you start,
 * how you move, what it is worth, what will be held against you, and that a
 * level has more than one answer.
 *
 * Five of them, as drawn. This is the designed screen and the list is not the
 * place to be clever — anything else the player needs to know has the whole
 * rest of the game to say it in.
 */
const RULES = [
  {
    Icon: StartIcon,
    title: "Pick a junction to start your route.",
    detail: "Everyone starts together.",
  },
  {
    Icon: TapIcon,
    title: "Tap a junction to run there.",
    detail: "Tap the one you came from to undo.",
  },
  {
    Icon: TrophyIcon,
    title: "Score club points.",
    detail: "Win a place on the leaderboard.",
  },
  {
    Icon: EyesIcon,
    title: "Follow the rules.",
    detail: "The committee will be watching.",
  },
  {
    Icon: RoutesIcon,
    title: "There are multiple winning routes per level.",
    detail: "But there are loads of ways to lose.",
  },
];

/**
 * How the game works, not how this week's run works. It opens itself on a
 * first visit and lives under the ? after that, so it has to make sense
 * whichever run happens to be loaded — the brief for a particular run belongs
 * to the objective checklist, which is always on screen and updates as you
 * plan.
 *
 * Two columns on anything wide enough: the countryside and its signpost on the
 * left, the rules on the right. A phone gets the rules and drops the scene to
 * a strip along the top, because on a phone the rules are the whole point and
 * the picture is the part that can afford to shrink.
 *
 * It arrives rather than appears (#27): the card lands, the rules deal
 * themselves out one after another, and the tip at the bottom keeps turning
 * over for as long as the screen is up. The arrival is all CSS, so
 * `prefers-reduced-motion` switches it off without being asked; the tip runs
 * on a timer, so it has to ask.
 */
export function HelpDialog({ level, onClose }: Props) {
  const reducedMotion = useReducedMotion();

  // Where the rotation is when the screen opens: on from wherever the last
  // visit left it, or somewhere random on the first.
  const [tip, setTip] = useState(() => {
    lastTip = nextTipIndex(lastTip, Math.random());
    return lastTip;
  });

  /*
   * And on from there while the screen is up.
   *
   * Reduced motion holds it on one, which is the setting that already means
   * "stop changing things at me" everywhere else in the game — and it is the
   * way out for anybody who needs the line to stay still long enough to read.
   */
  useEffect(() => {
    if (reducedMotion) return;
    const turn = setInterval(() => {
      lastTip = nextTipIndex(lastTip);
      setTip(lastTip);
    }, TIP_HOLD_MS);
    return () => clearInterval(turn);
  }, [reducedMotion]);

  return (
    <Dialog
      titleId="help-title"
      describedBy="help-intro"
      className="dialog--rules"
      closeLabel="how to play"
      onClose={onClose}
    >
      <h2 id="help-title" className="rules__title" tabIndex={-1}>
        <TitleSparks />
        How to play
        <TitleSparks flip />
      </h2>
      <p id="help-intro" className="rules__subtitle">
        Plan it, run it, take the blame
      </p>

      <div className="rules__body">
        {/* Decorative: the signpost is drawn into the picture, and every place
            on it is on the map anyway. */}
        <div className="rules__scene" role="presentation" />

        <div className="rules__panel">
          <h3 className="rules__heading">The rules</h3>
          <ul className="rules__list">
            {RULES.map(({ Icon, title, detail }, index) => (
              // Dealt out in order, so the eye is taken down the list rather
              // than dropped in the middle of five cards at once.
              <li
                key={title}
                className="rule"
                style={{ "--deal": `${index * 90}ms` } as React.CSSProperties}
              >
                <Icon />
                <span className="rule__words">
                  <span className="rule__title">{title}</span>
                  <span className="rule__detail">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="rules__today">
        <strong>Today:</strong> {level.title} — {level.strapline}
      </p>

      <div className="rules__footer">
        <p className="rules__tip">
          <MegaphoneIcon />
          {/* Keyed on the tip so a new one is a new element, and fades in
              rather than being swapped out from under the last one. */}
          <span key={tip} className="rules__tip-line">
            {tips[tip]}
          </span>
        </p>

        <span className="rules__pigeon" aria-hidden="true">
          <Pigeon />
          <PigeonTrail />
        </span>

        <button type="button" className="button button--primary rules__go" onClick={onClose}>
          Right, off we go
        </button>
      </div>
    </Dialog>
  );
}
