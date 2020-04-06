import {
  Point,
  Orientation,
  toDelta,
  clockwise,
  counterclockwise
} from "../utils/geometry";
import { Job, Instruction, InstructionType, Prop } from "./instructions";

export interface StackFrame {
  jobname: string;
  instruction: number;
}

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

export function executeInstruction(
  instr: Instruction,
  cpu: Processor,
  senses: Senses,
  actuators: Actuators
) {
  const interactor = {
    ...addJob(cpu, {
      jobname: "#interactive",
      work: [instr]
    }),
    stack: cpu.stack.concat([
      {
        jobname: "#interactive",
        instruction: 0
      }
    ])
  };

  const after = cycle(interactor, senses, actuators);
  return {
    ...after,
    stack: after.stack.filter(st => st.jobname !== "#interactive")
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

  const ir = cpu.stack[cpu.stack.length - 1];
  const job = cpu.jobs[ir.jobname];
  let inst = job.work[ir.instruction];

  const nextStack = cpu.stack.concat();
  const frame = nextStack.pop()!;
  let nextInstruction: StackFrame | undefined = {
    jobname: frame.jobname,
    instruction: frame.instruction + 1
  };

  if (nextInstruction.instruction === job.work.length) {
    nextInstruction = undefined;
  }

  while ("condition" in inst) {
    const reg = cpu.registers[inst.condition];
    if (reg === false) {
      if (nextInstruction) {
        nextStack.push(nextInstruction);
      }
      return { ...cpu, stack: nextStack };
    }

    inst = inst.subject;
  }

  const nextReg = { ...cpu.registers };
  switch (inst.kind) {
    // Control
    case InstructionType.repeat:
      nextStack.push({
        jobname: frame.jobname,
        instruction: 0
      });
      break;
    case InstructionType.finish:
      // handle by declining to push another instruction
      break;
    case InstructionType.doit:
      if (nextInstruction) {
        nextStack.push(nextInstruction);
      }
      nextStack.push({
        jobname: inst.jobname,
        instruction: 0
      });
      break;
    // Senses
    case InstructionType.look:
      {
        const saw = senses.look(toDelta(senses.orientation()));
        const yes = saw && saw.what === inst.prop;
        nextReg.yes = !!yes;
        nextReg.no = !yes;
        if (nextInstruction) {
          nextStack.push(nextInstruction);
        }
      }
      break;
    case InstructionType.touch:
      {
        const saw = senses.look(toDelta(senses.orientation()));
        const yes = saw && saw.what === inst.prop && saw.where === 0;
        nextReg.yes = !!yes;
        nextReg.no = !yes;
        if (nextInstruction) {
          nextStack.push(nextInstruction);
        }
      }
      break;
    // Interventions
    case InstructionType.eat:
      actuators.eat(toDelta(senses.orientation()));
      if (nextInstruction) {
        nextStack.push(nextInstruction);
      }
      break;
    case InstructionType.punch:
      actuators.punch(toDelta(senses.orientation()));
      if (nextInstruction) {
        nextStack.push(nextInstruction);
      }
      break;
    // Moves
    case InstructionType.forward:
      actuators.go(toDelta(senses.orientation()));
      if (nextInstruction) {
        nextStack.push(nextInstruction);
      }
      break;
    case InstructionType.backward:
      actuators.go(toDelta(clockwise(clockwise(senses.orientation()))));
      if (nextInstruction) {
        nextStack.push(nextInstruction);
      }
      break;
    // Turns
    case InstructionType.left:
      const leftward = counterclockwise(senses.orientation());
      actuators.turn(leftward);
      if (nextInstruction) {
        nextStack.push(nextInstruction);
      }
      break;
    case InstructionType.right:
      const rightward = clockwise(senses.orientation());
      actuators.turn(rightward);
      if (nextInstruction) {
        nextStack.push(nextInstruction);
      }
      break;
    // Marks
    case InstructionType.setmark:
      actuators.setmark();
      if (nextInstruction) {
        nextStack.push(nextInstruction);
      }
      break;
    case InstructionType.erase:
      actuators.erase();
      if (nextInstruction) {
        nextStack.push(nextInstruction);
      }
      break;
    default:
      throw new Error("unknown instruction type: " + inst);
  }

  return {
    jobs: cpu.jobs,
    registers: nextReg,
    stack: nextStack
  };
}
