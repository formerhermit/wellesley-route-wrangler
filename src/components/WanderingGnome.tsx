import { Gnome } from "./MapSprites";
import type { GnomeHome } from "../game/eggs";
import type { Level } from "../game/types";

interface Props {
  level: Level;
  home: GnomeHome | undefined;
  onPress: () => void;
}

/**
 * The one gnome in the game (#104).
 *
 * He is drawn from state rather than from any level's `scatter`, because he is
 * only ever in one place and that place changes: written into level data he
 * would be on every map at once. Nothing else about him is special — he is
 * `aria-hidden` decoration like the rest of the furniture, and he scores
 * nothing.
 *
 * Drawn on top of the roads rather than under them, which the scenery never
 * is. He has just arrived; a gnome half under a road would read as a mistake
 * rather than as a gnome.
 */
export function WanderingGnome({ level, home, onPress }: Props) {
  if (!home || home.levelId !== level.id) return null;
  return (
    <g
      className="egg egg--gnome"
      aria-hidden="true"
      transform={`translate(${home.x} ${home.y})`}
      onClick={onPress}
    >
      <Gnome />
    </g>
  );
}
