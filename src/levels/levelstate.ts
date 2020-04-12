import { Point, Rect, Orientation } from "../utils/geometry";
import { Terrain } from "./terrain";

export enum CharacterType {
  hero = "hero",
  heart = "heart"
}

export interface Actor {
  readonly ctype: CharacterType;
  readonly position: Rect;
  readonly orientation: Orientation;
}

export interface LevelState {
  readonly terrain: Terrain;
  readonly marks: boolean[][];
  readonly actors: Actor[];
}

export function setMark(level: LevelState, x: number, y: number) {
  if (level.marks[y][x]) {
    return level;
  }

  const marks = level.marks.map((row, atY) => {
    if (atY !== y) {
      return row;
    }

    return row.map((m, atX) => m || x === atX);
  });

  return {
    ...level,
    marks
  };
}

export function eraseMark(level: LevelState, x: number, y: number) {
  if (!level.marks[y][x]) {
    return level;
  }

  const marks = level.marks.map((row, atY) => {
    if (atY !== y) {
      return row;
    }

    return row.map((m, atX) => (x === atX ? false : m));
  });

  return {
    ...level,
    marks
  };
}

export function hero(level: LevelState) {
  return level.actors.find(a => a.ctype === CharacterType.hero)!;
}

export function stuffAt(level: LevelState, check: Point) {
  if (
    check.y < 0 ||
    check.x < 0 ||
    check.y >= level.terrain.furniture.length ||
    check.x >= Math.max(...level.terrain.furniture.map(row => row.length))
  ) {
    return null;
  }

  const actors = level.actors.filter(they => {
    const theypos = they.position;
    for (let theyx = 0; theyx < theypos.width; theyx++) {
      for (let theyy = 0; theyy < theypos.height; theyy++) {
        if (
          theypos.top + theyy === check.y &&
          theypos.left + theyx === check.x
        ) {
          return true;
        }
      }
    }
    return undefined;
  });

  const [tilex, tiley] = [Math.floor(check.x), Math.floor(check.y)];

  const furniture = level.terrain.furniture[tiley][tilex];

  const mark = level.marks[tiley][tilex];

  return { actors, furniture, mark };
}

export function turn(level: LevelState, actor: Actor, orientation: Orientation) {
  const aNew = {
    ...actor,
    orientation
  };
  return {
    ...level,
    actors: level.actors.filter(a => a !== actor).concat([aNew])
  };
}

export function relocate(level: LevelState, actor: Actor, target: Point) {
  const aNew = {
    ...actor,
    position: {
      ...actor.position,
      top: target.y,
      left: target.x
    }
  };
  return {
    ...level,
    actors: level.actors.filter(a => a !== actor).concat([aNew])
  };
}
