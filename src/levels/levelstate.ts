import { Point, Rect, Orientation } from "../utils/geometry";
import { Terrain } from "./terrain";

// TODO no initalcaps
export enum CharacterType {
  Hero,
  Goblin
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

export function setMark(game: LevelState, x: number, y: number) {
  if (game.marks[y][x]) {
    return game;
  }

  const marks = game.marks.map((row, atY) => {
    if (atY !== y) {
      return row;
    }

    return row.map((m, atX) => m || x === atX);
  });

  return {
    ...game,
    marks
  };
}

export function eraseMark(game: LevelState, x: number, y: number) {
  if (!game.marks[y][x]) {
    return game;
  }

  const marks = game.marks.map((row, atY) => {
    if (atY !== y) {
      return row;
    }

    return row.map((m, atX) => (x === atX ? false : m));
  });

  return {
    ...game,
    marks
  };
}

export function hero(game: LevelState) {
  return game.actors.find(a => a.ctype === CharacterType.Hero)!;
}

export function stuffAt(game: LevelState, check: Point) {
  if (
    check.y < 0 ||
    check.x < 0 ||
    check.y >= game.terrain.furniture.length ||
    check.x >= Math.max(...game.terrain.furniture.map(row => row.length))
  ) {
    return null;
  }

  const actors = game.actors.filter(they => {
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

  const furniture = game.terrain.furniture[tiley][tilex];

  const mark = game.marks[tiley][tilex];

  return { actors, furniture, mark };
}

export function turn(game: LevelState, actor: Actor, orientation: Orientation) {
  const aNew = {
    ...actor,
    orientation
  };
  return {
    ...game,
    actors: game.actors.filter(a => a !== actor).concat([aNew])
  };
}

export function relocate(game: LevelState, actor: Actor, target: Point) {
  const aNew = {
    ...actor,
    position: {
      ...actor.position,
      top: target.y,
      left: target.x
    }
  };
  return {
    ...game,
    actors: game.actors.filter(a => a !== actor).concat([aNew])
  };
}
