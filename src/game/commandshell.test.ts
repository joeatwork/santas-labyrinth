import _ from "lodash";

import { Orientation } from "../utils/geometry";
import { runCommand, defineJob } from "./commandshell";
import { Tile } from "../levels/terrain";
import { CharacterType, hero } from "../levels/levelstate";
import { InstructionType } from "../robot/instructions";
import { newProcessor, addJob } from "../robot/processor";

const robot = {
  ctype: CharacterType.hero,
  orientation: Orientation.east,
  position: {
    top: 2,
    left: 2,
    width: 1,
    height: 1
  }
};

const heart = {
  ctype: CharacterType.heart,
  orientation: Orientation.west,
  position: {
    top: 1,
    left: 2,
    width: 1,
    height: 1
  }
};

const actors0 = [heart, robot];

const game0 = {
  terrain: {
    furniture: [
      [Tile.nothing, Tile.wall, Tile.wall, Tile.wall, Tile.nothing],
      [Tile.wall, Tile.floor, Tile.floor, Tile.floor, Tile.wall],
      [Tile.entrance, Tile.floor, Tile.floor, Tile.floor, Tile.wall],
      [Tile.wall, Tile.floor, Tile.floor, Tile.floor, Tile.wall],
      [Tile.nothing, Tile.wall, Tile.exit, Tile.wall, Tile.nothing]
    ]
  },
  marks: _.range(5).map(y => _.range(5).map(x => false)),
  actors: actors0
};

test("look treasure", () => {
  const newRobot = { ...robot, orientation: Orientation.north };
  const game = {
    ...game0,
    actors: [heart, newRobot]
  };
  const found = runCommand("look treasure\n", newRobot, newProcessor, game);
  expect(found.cpu.registers.yes).toBeTruthy();
});

test("look wall", () => {
  const found = runCommand("look wall\n", robot, newProcessor, game0);
  expect(found.cpu.registers.yes).toBeTruthy();
});

test("look fail", () => {
  const found = runCommand("look treasure\n", robot, newProcessor, game0);
  expect(found.cpu.registers.yes).toBeFalsy();
});

test("forward", () => {
  const found = runCommand("forward\n", robot, newProcessor, game0);
  const foundHero = hero(found.game);
  expect(foundHero.position).toEqual({ top: 2, left: 3, width: 1, height: 1 });
});

test("do job", () => {
  const proc = addJob(newProcessor, {
    jobname: "testjob",
    work: [{ kind: InstructionType.punch }]
  });
  const found = runCommand("do testjob\n", robot, proc, game0);
  expect(found.cpu.stack).toEqual([
    {
      jobname: "testjob",
      instruction: 0
    }
  ]);
});

test("define job", () => {
  const found = defineJob(
    newProcessor,
    "newjob",
    `
   punch
   do newjob
eat
`
  );

  expect(found.cpu.jobs["newjob"]).toEqual({
    jobname: "newjob",
    work: [
      { kind: InstructionType.punch },
      { kind: InstructionType.doit, jobname: "newjob" },
      { kind: InstructionType.eat }
    ]
  });
});

test("define bad name", () => {
  const found = defineJob(newProcessor, "look", "punch\n");
  expect(found.commandError.message).toMatch(/look.*see/);
});
