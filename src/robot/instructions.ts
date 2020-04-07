export enum Register {
  yes = "yes",
  no = "no"
}

export enum Prop {
  hero = "hero",
  wall = "wall",
  monster = "monster",
  treasure = "treasure",
  mark = "mark"
}

export enum InstructionType {
  eat = "eat",
  look = "look",
  setmark = "setmark",
  forward = "forward",
  backward = "backward",
  left = "left",
  right = "right",
  punch = "punch",
  touch = "touch",
  erase = "erase",
  repeat = "repeat",
  finish = "finish",
  doit = "do"
}

export interface Conditional {
  condition: Register;
  subject: Instruction;
}

export interface EatInstruction {
  kind: InstructionType.eat;
}

export interface LookInstruction {
  kind: InstructionType.look;
  prop: Prop;
}

export interface TouchInstruction {
  kind: InstructionType.touch;
  prop: Prop;
}

export interface SetmarkInstruction {
  kind: InstructionType.setmark;
}

export interface ForwardInstruction {
  kind: InstructionType.forward;
}

export interface BackwardInstruction {
  kind: InstructionType.backward;
}

export interface LeftInstruction {
  kind: InstructionType.left;
}

export interface RightInstruction {
  kind: InstructionType.right;
}

export interface PunchInstruction {
  kind: InstructionType.punch;
}

export interface EraseInstruction {
  kind: InstructionType.erase;
}

export interface RepeatInstruction {
  kind: InstructionType.repeat;
}

export interface FinishInstruction {
  kind: InstructionType.finish;
}

export interface DoInstruction {
  kind: InstructionType.doit;
  jobname: string;
}

export type Instruction =
  | Conditional
  | EatInstruction
  | LookInstruction
  | SetmarkInstruction
  | ForwardInstruction
  | BackwardInstruction
  | LeftInstruction
  | RightInstruction
  | PunchInstruction
  | TouchInstruction
  | EraseInstruction
  | RepeatInstruction
  | FinishInstruction
  | DoInstruction;

export interface Job {
  jobname: string;
  work: Instruction[];
}

export function toString(inst: Instruction): string {
  if ("condition" in inst) {
    const subj = toString(inst.subject);
    return `if ${Register[inst.condition]} ${subj}`;
  }

  switch (inst.kind) {
    case InstructionType.eat:
    case InstructionType.setmark:
    case InstructionType.punch:
    case InstructionType.erase:
    case InstructionType.repeat:
    case InstructionType.finish:
    case InstructionType.forward:
    case InstructionType.backward:
    case InstructionType.left:
    case InstructionType.right:
      return `${inst.kind}`;
    case InstructionType.doit:
      return `do ${inst.jobname}`;
    case InstructionType.look:
    case InstructionType.touch:
      return `${inst.kind} ${Prop[inst.prop]}`;
  }
}
