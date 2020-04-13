import { rectIntersect } from "../utils/geometry";
import { hero, CharacterType, LevelState } from "../levels/levelstate";
import { Processor } from "../robot/processor";

export function victory(level: LevelState) {
  const you = hero(level);
  const collisions = level.actors.filter(
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
