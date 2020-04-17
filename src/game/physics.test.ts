import _ from "lodash";

import { gameSenses } from "../game/physics";
import { Tile } from "../levels/terrain";
import { hero } from "../levels/levelstate";
import { simpleLevel } from "../levels/levelgen";
import { Prop } from "../robot/instructions";

describe("marks are only seen if looked for", () => {
  const level0 = simpleLevel();
  const marked = {
    ...level0,
    marks: level0.marks.map((row, y) =>
      row.map((_, x) => {
        return x === 1 && y === 2;
      })
    )
  };
  const robot = hero(level0);
  const senses0 = gameSenses(level0, robot);
  const markedSenses = gameSenses(marked, robot);

  test("look without mark", () => {
    expect(senses0.look({ x: -1, y: 0 }, Prop.doorway)).toEqual({
      what: Prop.doorway,
      where: 2
    });
  });

  test("look past mark", () => {
    expect(markedSenses.look({ x: -1, y: 0 }, Prop.doorway)).toEqual({
      what: Prop.doorway,
      where: 2
    });
  });

  test("look at mark", () => {
    expect(markedSenses.look({ x: -1, y: 0 }, Prop.mark)).toEqual({
      what: Prop.mark,
      where: 1
    });
  });
});

describe("look at various walls", () => {
  const level0 = simpleLevel();
  const robot = hero(level0);

  [Tile.eastWall, Tile.westWall, Tile.northWall, Tile.southWall].forEach(
    tile => {
      test(tile, () => {
        const level = _.set(
          simpleLevel(),
          ["terrain", "furniture", 2, 4],
          Tile.eastWall
        );
        const senses = gameSenses(level, hero(level));
        expect(senses.look({ x: 1, y: 0 }, Prop.wall)).toEqual({
          what: Prop.wall,
          where: 2
        });
      });
    }
  );
});
