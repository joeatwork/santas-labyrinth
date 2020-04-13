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

export function gameSenses(level: LevelState, robot: Actor) {
  return {
    orientation: () => {
      return robot.orientation;
    },
    look: (delta: Point) => {
      const check = {
        x: robot.position.left + delta.x,
        y: robot.position.top + delta.y
      };
      for (let i = 0; i < visionDistance; i++) {
        const stuff = stuffAt(level, check);
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
  readonly level: LevelState;
  readonly robot: Actor;
  issues: string | null;
  newlevel: LevelState;

  constructor(level: LevelState, robot: Actor) {
    this.level = level;
    this.robot = robot;
    this.newlevel = level;
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
    console.log(`punch ${pt.x}, ${pt.y}`);
  }

  turn(ot: Orientation) {
    this.newlevel = turn(this.level, this.robot, ot);
  }

  go(delta: Point) {
    const pt = this.newpt(delta);
    if (inbounds(this.level.terrain, pt.x, pt.y)) {
      this.newlevel = relocate(this.level, this.robot, pt);
    } else {
      this.issues = "move out of bounds";
    }
  }

  setmark() {
    this.newlevel = setMark(
      this.level,
      this.robot.position.left,
      this.robot.position.top
    );
  }

  erase() {
    this.newlevel = eraseMark(
      this.level,
      this.robot.position.left,
      this.robot.position.top
    );
  }
}

export function gameActuators(level: LevelState, robot: Actor) {
  return new GameActuators(level, robot);
}
