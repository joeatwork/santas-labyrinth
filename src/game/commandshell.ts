import _ from "lodash";

import { LevelState, Actor } from "../levels/levelstate";
import { Parser, validateJobName } from "../grammar/parser";
import {
  Processor,
  pushInstruction,
  addJob,
  cycle
} from "../robot/processor";
import { gameActuators, gameSenses } from "../game/physics";

const minMillisPerCycle = 50;

export enum CommandErrorSite {
  jobBody = "jobBody",
  jobName = "jobName",
  command = "command"
}

export type CommandError = {
  site: CommandErrorSite;
  message: string;
  line: number;
};

export function continueExecution(
  lastTick: number,
  thisTick: number,
  robot: Actor,
  cpu: Processor,
  game: LevelState
) {
  if (thisTick < 0) {
    return { lastTick: thisTick, cpu, game };
  }

  if (thisTick - lastTick < minMillisPerCycle) {
    return { lastTick, cpu, game };
  }

  if (cpu.stack.length === 0) {
    return { lastTick: thisTick, cpu, game };
  }

  const senses = gameSenses(game, robot);
  const actuators = gameActuators(game, robot);
  const newCpu = cycle(cpu, senses, actuators);
  const newGame = actuators.newgame;

  return {
    lastTick: thisTick,
    cpu: newCpu,
    game: newGame
  };
}

export function halt(cpu: Processor) {
  return {
    cpu: {
      ...cpu,
      stack: []
    }
  };
}

export function defineJob(cpu: Processor, jobname: string, jobtext: string) {
  const nameError = validateJobName(jobname);
  if (nameError) {
    return {
      cpu,
      commandError: {
        site: CommandErrorSite.jobName,
        message: nameError,
        line: -1
      }
    };
  }

  const parser = new Parser(_.keys(cpu.jobs).concat([jobname]));
  const jobbody = parser.parseInstructionList(jobtext);
  if (jobbody.kind === "fail") {
    return {
      cpu,
      commandError: {
        site: CommandErrorSite.jobBody,
        message: jobbody.message,
        line: jobbody.line
      }
    };
  }

  if (jobbody.kind === "continue") {
    return {
      cpu,
      commandError: {
        site: CommandErrorSite.jobBody,
        message:
          `it looks like one of your instructions is ` +
          `incomplete. Try adding ` +
          jobbody.completions.map(cm => `"${cm}"`).join(", "),
        line: jobbody.line
      }
    };
  }

  return {
    cpu: addJob(cpu, {
      jobname: jobname,
      work: jobbody.result
    }),
    commandError: null
  };
}

export function runCommand(
  cmdText: string,
  robot: Actor,
  cpu: Processor,
  game: LevelState
) {
  const parser = new Parser(_.keys(cpu.jobs));
  const cmd = parser.parseInstruction(cmdText);
  if (cmd.kind === "fail") {
    return {
      commandError: {
        site: CommandErrorSite.command,
        message: cmd.message,
        line: 0
      }
    };
  }

  if (cmd.kind === "continue") {
    return {
      commandError: null
    };
  }

  return {
    commandError: null,
    cpu: pushInstruction(cmd.result, cpu)
  };
}
