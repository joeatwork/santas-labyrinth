import { Point, Orientation } from "../utils/geometry";
import {
  LevelState,
  Actor,
  stuffAt,
  turn,
  relocate,
  setMark,
  eraseMark
} from "../levels/levelstate";
import { Prop } from "../robot/instructions";
import { CharacterType } from "../levels/levelstate";
import { inbounds, passable } from "../levels/terrain";

const visionDistance = 10;

function characterToProp(c: CharacterType): Prop {
  switch (c) {
    case CharacterType.hero:
      return Prop.hero;
    case CharacterType.heart:
      return Prop.treasure;
  }
}

export function gameSenses(game: LevelState, robot: Actor) {
  return {
    orientation: () => {
      return robot.orientation;
    },
    look: (delta: Point) => {
      // Look and touch the midpoint of the tile
      const check = {
        x: robot.position.left + delta.x,
        y: robot.position.top + delta.y
      };
      for (let i = 0; i < visionDistance; i++) {
        const stuff = stuffAt(game, check);
        if (!stuff) {
          break;
        }
        const { actors, furniture, mark } = stuff;
        if (actors.length > 0) {
          return {
            what: characterToProp(actors[0].ctype),
            where: i
          };
        }

        if (!passable(furniture)) {
          return { what: Prop.wall, where: i };
        }

        if (mark) {
          return { what: Prop.mark, where: i };
        }

        check.x += delta.x;
        check.y += delta.y;
      }
    }
  };
}

class GameActuators {
  readonly game: LevelState;
  readonly robot: Actor;
  issues: string | null;
  newgame: LevelState;

  constructor(game: LevelState, robot: Actor) {
    this.game = game;
    this.robot = robot;
    this.newgame = game;
    this.issues = null;
  }

  newpt(delta: Point) {
    return {
      x: this.robot.position.left + delta.x,
      y: this.robot.position.top + delta.y
    };
  }

  eat(delta: Point) {
    const pt = this.newpt(delta);
    console.log(`eat ${pt.x}, ${pt.y}`);
  }

  punch(delta: Point) {
    const pt = this.newpt(delta);
    console.log(`eat ${pt.x}, ${pt.y}`);
  }

  turn(ot: Orientation) {
    this.newgame = turn(this.game, this.robot, ot);
  }

  go(delta: Point) {
    const pt = this.newpt(delta);
    if (inbounds(this.game.terrain, pt.x, pt.y)) {
      this.newgame = relocate(this.game, this.robot, pt);
    } else {
      this.issues = "move out of bounds";
    }
  }

  setmark() {
    this.newgame = setMark(
      this.game,
      this.robot.position.left,
      this.robot.position.top
    );
  }

  erase() {
    this.newgame = eraseMark(
      this.game,
      this.robot.position.left,
      this.robot.position.top
    );
  }
}

export function gameActuators(game: LevelState, robot: Actor) {
  return new GameActuators(game, robot);
}
