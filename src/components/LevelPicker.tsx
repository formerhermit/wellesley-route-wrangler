import type { Level } from "../game/types";

interface Props {
  levels: Level[];
  currentId: string;
  disabled: boolean;
  onSelect: (level: Level) => void;
}

export function LevelPicker({ levels, currentId, disabled, onSelect }: Props) {
  if (levels.length < 2) return null;

  return (
    <nav className="level-picker" aria-label="Choose a run">
      {levels.map((level) => {
        const current = level.id === currentId;
        return (
          <button
            key={level.id}
            type="button"
            className={`level-picker__option${current ? " is-current" : ""}`}
            aria-current={current ? "true" : undefined}
            disabled={disabled}
            onClick={() => onSelect(level)}
          >
            {level.title}
          </button>
        );
      })}
    </nav>
  );
}
