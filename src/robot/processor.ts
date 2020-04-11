import {
  Point,
  Orientation,
  toDelta,
  clockwise,
  counterclockwise
} from "../utils/geometry";
import { Job, Instruction, InstructionType, Prop } from "./instructions";

interface Immediate {
  kind: "immediate";
  instr: Instruction;
}

interface JobFrame {
  kind: "jobframe";
  jobname: string;
  index: number;
}

type StackFrame = Immediate | JobFrame;

export interface Processor {
  readonly registers: { yes: boolean; no: boolean };
  readonly jobs: { [key: string]: Job };
  readonly stack: StackFrame[];
}

export const newProcessor: Processor = {
  registers: { yes: false, no: true },
  jobs: {},
  stack: []
};

export function addJob(cpu: Processor, job: Job): Processor {
  return {
    ...cpu,
    jobs: {
      ...cpu.jobs,
      [job.jobname]: job
    }
  };
}

export interface Senses {
  look: (delta: Point) => { what: Prop; where: number } | undefined;
  orientation: () => Orientation;
}

export interface Actuators {
  eat: (delta: Point) => void;
  punch: (delta: Point) => void;
  go: (delta: Point) => void;
  turn: (ot: Orientation) => void;
  setmark: () => void;
  erase: () => void;
}

export function pushInstruction(instr: Instruction, cpu: Processor) {
  return {
    ...cpu,
    stack: cpu.stack.concat([
      {
        kind: "immediate",
        instr
      }
    ])
  };
}

export function cycle(
  cpu: Processor,
  senses: Senses,
  actuators: Actuators
): Processor {
  if (cpu.stack.length === 0) {
    throw Error("Stack underflow");
  }

  const nextStack = cpu.stack.concat();
  const frame = nextStack.pop()!;

  let instr: Instruction;
  let nextFrame: StackFrame | undefined;
  switch (frame.kind) {
    case "immediate":
      instr = frame.instr;
      break;
    case "jobframe":
      const job = cpu.jobs[frame.jobname];
      instr = job.work[frame.index];
      nextFrame = {
        ...frame,
        index: frame.index + 1
      };
      if (nextFrame.index === job.work.length) {
        nextFrame = undefined;
      }
      break;
  }

  while ("condition" in instr) {
    const reg = cpu.registers[instr.condition];
    if (reg === false) {
      if (nextFrame) {
        nextStack.push(nextFrame);
      }
      return { ...cpu, stack: nextStack };
    }

    instr = instr.subject;
  }

  const nextReg = { ...cpu.registers };
  switch (instr.kind) {
    // Control
    case InstructionType.repeat:
      if ("jobname" in frame) {
        nextStack.push({
          ...frame,
          index: 0
        });
      }
      break;
    case InstructionType.finish:
      // handle by declining to push another instruction
      break;
    case InstructionType.doit:
      if (nextFrame) {
        nextStack.push(nextFrame);
      }
      nextStack.push({
        kind: "jobframe",
        jobname: instr.jobname,
        index: 0
      });
      break;
    // Senses
    case InstructionType.look:
      {
        const saw = senses.look(toDelta(senses.orientation()));
        const yes = saw && saw.what === instr.prop;
        nextReg.yes = !!yes;
        nextReg.no = !yes;
        if (nextFrame) {
          nextStack.push(nextFrame);
        }
      }
      break;
    case InstructionType.touch:
      {
        const saw = senses.look(toDelta(senses.orientation()));
        const yes = saw && saw.what === instr.prop && saw.where === 0;
        nextReg.yes = !!yes;
        nextReg.no = !yes;
        if (nextFrame) {
          nextStack.push(nextFrame);
        }
      }
      break;
    // Interventions
    case InstructionType.eat:
      actuators.eat(toDelta(senses.orientation()));
      if (nextFrame) {
        nextStack.push(nextFrame);
      }
      break;
    case InstructionType.punch:
      actuators.punch(toDelta(senses.orientation()));
      if (nextFrame) {
        nextStack.push(nextFrame);
      }
      break;
    // Moves
    case InstructionType.forward:
      actuators.go(toDelta(senses.orientation()));
      if (nextFrame) {
        nextStack.push(nextFrame);
      }
      break;
    case InstructionType.backward:
      actuators.go(toDelta(clockwise(clockwise(senses.orientation()))));
      if (nextFrame) {
        nextStack.push(nextFrame);
      }
      break;
    // Turns
    case InstructionType.left:
      const leftward = counterclockwise(senses.orientation());
      actuators.turn(leftward);
      if (nextFrame) {
        nextStack.push(nextFrame);
      }
      break;
    case InstructionType.right:
      const rightward = clockwise(senses.orientation());
      actuators.turn(rightward);
      if (nextFrame) {
        nextStack.push(nextFrame);
      }
      break;
    // Marks
    case InstructionType.setmark:
      actuators.setmark();
      if (nextFrame) {
        nextStack.push(nextFrame);
      }
      break;
    case InstructionType.erase:
      actuators.erase();
      if (nextFrame) {
        nextStack.push(nextFrame);
      }
      break;
    default:
      throw new Error("unknown instruction type: " + instr);
  }

  return {
    jobs: cpu.jobs,
    registers: nextReg,
    stack: nextStack
  };
}
