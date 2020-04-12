import { rectIntersect } from "../utils/geometry";
import { hero, CharacterType, LevelState } from "../levels/levelstate";
import { AllState } from "../state/states";
import { AllActions, Actions } from "../state/actions";
import { GameStateKind } from "../game/gamestate";

export function gameTriggers(
  state: AllState,
  dispatch: (action: AllActions) => void
) {
  if (state.game.kind !== GameStateKind.level) {
    return;
  }

  if (victory(state.level)) {
    dispatch({
      type: Actions.victoryTrigger
    });
  }
}

function victory(level: LevelState) {
  const you = hero(level);
  const collisions = level.actors.filter(
    a => a !== you && rectIntersect(you.position, a.position)
  );

  return collisions.some(a => a.ctype === CharacterType.heart);
}
