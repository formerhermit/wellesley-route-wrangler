import { Dialog } from "./Dialog";
import {
  EyesIcon,
  LoopIcon,
  MegaphoneIcon,
  PigeonTrail,
  RoutesIcon,
  StartIcon,
  TapIcon,
  TitleSparks,
  TrophyIcon,
} from "./RulesIcons";
import { clubTableEnabled } from "../club/enabled";
import type { Level } from "../game/types";

interface Props {
  level: Level;
  onClose: () => void;
}

const PIGEON = `${import.meta.env.BASE_URL}sprites/pigeon-standing.png`;

/**
 * The rules, one to a card, in the order somebody meets them: where you start,
 * how you move, what it is worth, what will be held against you, and then the
 * two things that are not obvious from playing — that a level has several
 * answers, and that a loop is one route whichever way round it is run.
 *
 * That last one earns its place. It decides what banks, and a player who never
 * reads it will run a loop backwards and wonder why the club shrugged.
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
    // Promising a leaderboard on a build that has none would be a lie the
    // first tap exposes, so the line follows what was actually configured.
    detail: clubTableEnabled
      ? "Win a place on the leaderboard."
      : "The club keeps a running total.",
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
  {
    Icon: LoopIcon,
    title: "A loop counts once.",
    detail: "Whichever way round you run it.",
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
 */
export function HelpDialog({ level, onClose }: Props) {
  return (
    <Dialog
      titleId="help-title"
      describedBy="help-intro"
      className="dialog--rules"
      onClose={onClose}
    >
      <button
        type="button"
        className="rules__close"
        onClick={onClose}
        aria-label="Close how to play"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 7l10 10M17 7L7 17" />
        </svg>
      </button>

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
            {RULES.map(({ Icon, title, detail }) => (
              <li key={title} className="rule">
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
          <span>Nobody has ever agreed on what counts as a hill</span>
        </p>

        <span className="rules__pigeon" aria-hidden="true">
          <img src={PIGEON} alt="" width={186} height={190} />
          <PigeonTrail />
        </span>

        <button type="button" className="button button--primary rules__go" onClick={onClose}>
          Right, off we go
        </button>
      </div>
    </Dialog>
  );
}
