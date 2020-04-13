import { rectIntersect } from "../utils/geometry";
import { hero, CharacterType } from "../levels/levelstate";
import { Processor } from "../robot/processor";
import { GameState, GameStateKind } from "../game/gamestate";

export function victory(game: GameState) {
  if (game.kind !== GameStateKind.running && game.kind !== GameStateKind.composing) {
    return false;
  }

  const you = hero(game.level);
  const collisions = game.level.actors.filter(
    a => a !== you && rectIntersect(you.position, a.position)
  );

  return collisions.some(a => a.ctype === CharacterType.heart);
}

export function running(before: Processor, after: Processor) {
  return (before.stack.length === 0 && after.stack.length > 0);
}

export function halted(before: Processor, after: Processor) {
  return (before.stack.length > 0 && after.stack.length === 0);
}
