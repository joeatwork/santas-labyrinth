import { simpleLevel } from "../levels/levelgen";
import { Orientation } from "../utils/geometry";
import { runCommand, defineJob, continueExecution } from "./commandshell";
import { Tile } from "../levels/terrain";
import { CharacterType, hero } from "../levels/levelstate";
import { InstructionType } from "../robot/instructions";
import { newProcessor, addJob } from "../robot/processor";

const game0 = simpleLevel();
const [robot, heart] = game0.actors;

test("look treasure", () => {
  const newRobot = { ...robot, orientation: Orientation.north };
  const game = {
    ...game0,
    actors: [heart, newRobot]
  };
  const {cpu} = runCommand("look treasure\n", newRobot, newProcessor, game);
  const found = continueExecution(10, 1000, newRobot, cpu, game);
  expect(found.cpu.registers.yes).toBeTruthy();
});

test("look wall", () => {
  const {cpu} = runCommand("look wall\n", robot, newProcessor, game0);
  const found = continueExecution(10, 1000, robot, cpu, game0);
  expect(found.cpu.registers.yes).toBeTruthy();
});

test("look fail", () => {
  const {cpu} = runCommand("look treasure\n", robot, newProcessor, game0);
  const found = continueExecution(10, 1000, robot, cpu, game0);
  expect(found.cpu.registers.yes).toBeFalsy();
});

test("forward", () => {
  const {cpu} = runCommand("forward\n", robot, newProcessor, game0);
  const found = continueExecution(10, 1000, robot, cpu, game0);
  const foundHero = hero(found.game);
  expect(foundHero.position).toEqual({ top: 2, left: 3, width: 1, height: 1 });
});

test("do job", () => {
  const proc = addJob(newProcessor, {
    jobname: "testjob",
    work: [{ kind: InstructionType.punch }]
  });
  const {cpu} = runCommand("do testjob\n", robot, proc, game0);
  const found = continueExecution(10, 1000, robot, cpu, game0);
  expect(found.cpu.stack).toEqual([
    {
      kind: "jobframe",
      jobname: "testjob",
      index: 0
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
