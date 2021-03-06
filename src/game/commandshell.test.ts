import _ from "lodash";

import { simpleLevel } from "../levels/levelgen";
import { Orientation } from "../utils/geometry";
import { runCommand, defineJob, continueExecution } from "./commandshell";
import { Tile } from "../levels/terrain";
import { CharacterType, hero } from "../levels/levelstate";
import { InstructionType } from "../robot/instructions";
import { newProcessor, addJob } from "../robot/processor";

const level0 = simpleLevel();
const [robot, heart] = level0.actors;

test("look treasure", () => {
  const newRobot = { ...robot, orientation: Orientation.north };
  const level = {
    ...level0,
    actors: [heart, newRobot]
  };
  const { cpu } = runCommand("look treasure\n", newRobot, newProcessor, level);
  const found = continueExecution(10, 1000, newRobot, cpu, level);
  expect(found.cpu.registers.yes).toBeTruthy();
});

test("look wall", () => {
  const { cpu } = runCommand("look wall\n", robot, newProcessor, level0);
  const found = continueExecution(10, 1000, robot, cpu, level0);
  expect(found.cpu.registers.yes).toBeTruthy();
});

test("touch mark", () => {
  const level = _.set(simpleLevel(), ["marks", 2, 3], true);
  const { cpu } = runCommand("touch mark\n", robot, newProcessor, level);
  const found = continueExecution(10, 1000, robot, cpu, level);
  expect(found.cpu.registers.yes).toBeTruthy();
});

test("look fail", () => {
  const { cpu } = runCommand("look treasure\n", robot, newProcessor, level0);
  const found = continueExecution(10, 1000, robot, cpu, level0);
  expect(found.cpu.registers.yes).toBeFalsy();
});

test("forward", () => {
  const { cpu } = runCommand("forward\n", robot, newProcessor, level0);
  const found = continueExecution(10, 1000, robot, cpu, level0);
  const foundHero = hero(found.game.level);
  expect(foundHero.position).toEqual({ top: 2, left: 3, width: 1, height: 1 });
});

test("do job", () => {
  const proc = addJob(newProcessor, {
    jobname: "testjob",
    work: [{ kind: InstructionType.punch }]
  });
  const { cpu } = runCommand("do testjob\n", robot, proc, level0);
  const found = continueExecution(10, 1000, robot, cpu, level0);
  expect(found.cpu.stack).toEqual([
    {
      kind: "jobframe",
      jobname: "testjob",
      index: 0
    }
  ]);
});

describe("defineJob", () => {
  test("simple case", () => {
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

  test("redefine job", () => {
    const found = defineJob(
      {
        ...newProcessor,
        jobs: {
          newjob: {
            jobname: "newjob",
            work: [{ kind: InstructionType.forward }]
          }
        }
      },
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
});

test("define bad name", () => {
  const found = defineJob(newProcessor, "look", "punch\n");
  expect(found.commandError.message).toMatch(/look.*see/);
});
