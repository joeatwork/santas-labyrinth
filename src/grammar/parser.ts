import _ from "lodash";

import {
  Prop,
  Register,
  InstructionType,
  Instruction
} from "../robot/instructions";

// This weird, homemade parser allows us to generate
// autocomplete suggestions using the same logic that
// we use to parse commands.

export interface ParseSuccess<T> {
  kind: "success";
  result: T;
}

export interface ParseContinue {
  kind: "continue";
  completions: string[];
  line: number;
}

export interface ParseFail {
  kind: "fail";
  message: string;
  line: number;
}

export type ParseResult<T> = ParseSuccess<T> | ParseContinue | ParseFail;

type TokenResult =
  | ParseFail
  | {
      token: string | null;
      completions: string[];
      remainder: string;
    };

export const commandWords = [
  "eat",
  "forward",
  "backward",
  "left",
  "right",
  "punch",
  "setmark",
  "erase",
  "repeat",
  "finish",
  "touch",
  "look",
  "do",
  "if"
];

export function validateJobName(s: string) {
  if (!/^[A-Za-z]\w*$/.exec(s)) {
    return "job names should begin with a capital or lowercase letter, and only contain letters and numbers after that.";
  }

  if (s in reservedWords) {
    return (
      `"${s}" can't be used for a job name. ` +
      `Would "${reservedWords[s]}" work instead?`
    );
  }
}

export class Parser {
  readonly jobnames: string[];

  constructor(jobnames: string[]) {
    this.jobnames = jobnames;
  }

  public parseInstructionList(s: string): ParseResult<Instruction[]> {
    const lines = s.split("\n");
    const instructions = lines.flatMap((ln, i) => {
      return ln
        .split(/;/)
        .filter(x => !x.match(/^\s*$/))
        .map(inst => ({ inst, line: i }));
    });

    const results = instructions.map(({ inst, line }) => {
      return {
        line,
        result: this.parseInstruction(inst + "\n")
      };
    });

    const failure = results.find(({ result }) => result.kind !== "success");

    if (failure) {
      const failResult = failure.result as ParseContinue | ParseFail;
      return {
        ...failResult,
        line: failure.line
      };
    }

    const successes = results.map(rs => rs.result as ParseSuccess<Instruction>);

    return {
      kind: "success",
      result: successes.map(rs => rs.result)
    };
  }

  public parseInstruction(
    s: string,
    completionPrefix: string = ""
  ): ParseResult<Instruction> {
    const found = this.nextToken(s, commandWords);
    if (!("token" in found)) {
      return found;
    }

    const { completions, token, remainder } = found;
    if (completions.length === 0) {
      return {
        kind: "fail",
        line: 0,
        message:
          `"${token}" isn't a verb I know. ` +
          ' Try "forward", "left", or "right" to move the robot.'
      };
    }

    if (completions.length === 1 && completions[0] === token) {
      if (token === "if") {
        return this.parseRegisterCondition(
          remainder,
          `${completionPrefix}${token} `
        );
      }

      switch (token) {
        case InstructionType.forward:
        case InstructionType.backward:
        case InstructionType.left:
        case InstructionType.right:
        case InstructionType.punch:
        case InstructionType.eat:
        case InstructionType.setmark:
        case InstructionType.erase:
        case InstructionType.repeat:
        case InstructionType.finish:
          return this.parseEnd(
            remainder,
            { kind: token },
            `${completionPrefix}${token}`
          );
        case InstructionType.look:
        case InstructionType.touch:
          return this.parseProp(
            remainder,
            token,
            `${completionPrefix}${token} `
          );
        case InstructionType.doit:
          return this.parseJobName(remainder, `${completionPrefix}${token} `);
      }
    }

    return {
      kind: "continue",
      completions: completions.map(cp => `${completionPrefix}${cp}`),
      line: 0
    };
  }

  private nextToken(s: string, accept: string[]): TokenResult {
    const pattern = /^[ \t]*(\S+)/y;
    const match = pattern.exec(s);
    if (!match) {
      if (/^[ \t]*$/.exec(s)) {
        return {
          token: null,
          completions: accept,
          remainder: s
        };
      }

      // Some weird trailers or endline stuff
      return {
        kind: "fail",
        line: 0,
        message:
          "It looks like your command ends to early. " +
          "try putting one of these words before the new line: " +
          accept.map(ac => `"${ac}"`).join(", ")
      };
    }

    const token = match[1];
    return {
      token,
      completions: accept.filter(ac => ac.startsWith(token)),
      remainder: s.substring(pattern.lastIndex)
    };
  }

  private parseEnd(
    s: string,
    result: Instruction,
    completionPrefix: string
  ): ParseResult<Instruction> {
    if (s.match(/^[ \t]*\n$/)) {
      return {
        kind: "success",
        result
      };
    }

    if (s.match(/^[ \t]*$/)) {
      return {
        kind: "continue",
        completions: [`${completionPrefix}\n`],
        line: 0
      };
    }

    return {
      kind: "fail",
      line: 0,
      message:
        "Found some extra stuff after the command. " +
        `Try adding a line break before "...${s.substring(0, 10)}"`
    };
  }

  private parseProp(
    s: string,
    tp: InstructionType.look | InstructionType.touch,
    completionPrefix: string
  ): ParseResult<Instruction> {
    const props = _.values(Prop);
    const found = this.nextToken(s, props);
    if (!("token" in found)) {
      return found;
    }

    const { completions, token, remainder } = found;
    if (completions.length === 0) {
      return {
        kind: "fail",
        line: 0,
        message:
          `"${token}" isn't a thing that can be looked at or touched. ` +
          ` Try ${props.join(", ")}`
      };
    }

    if (completions.length === 1 && completions[0] === token) {
      return this.parseEnd(
        remainder,
        {
          kind: tp,
          prop: token as Prop
        },
        `${completionPrefix}${token}`
      );
    }

    return {
      kind: "continue",
      completions: completions.map(cp => `${completionPrefix}${cp}`),
      line: 0
    };
  }

  private parseJobName(
    s: string,
    completionPrefix: string
  ): ParseResult<Instruction> {
    const found = this.nextToken(s, this.jobnames);
    if (!("token" in found)) {
      return found;
    }

    const { completions, token, remainder } = found;

    if (completions.length === 0) {
      return {
        kind: "fail",
        line: 0,
        message:
          `${token} isn't the name of a job. ` +
          `try something like ` +
          this.jobnames.map(jn => `do ${jn}`).join(", ")
      };
    }

    if (completions.length === 1 && completions[0] === token) {
      return this.parseEnd(
        remainder,
        {
          kind: InstructionType.doit,
          jobname: token
        },
        `${completionPrefix}${token}`
      );
    }

    return {
      kind: "continue",
      completions: completions.map(cp => `${completionPrefix}${cp}`),
      line: 0
    };
  }

  private parseRegisterCondition(
    s: string,
    completionPrefix: string
  ): ParseResult<Instruction> {
    const regnames = _.values(Register);
    const found = this.nextToken(s, regnames);
    if (!("token" in found)) {
      return found;
    }

    const { completions, token, remainder } = found;
    if (completions.length === 0) {
      return {
        kind: "fail",
        line: 0,
        message:
          "conditional instructions need a register name " +
          "before the instruction. Try something like " +
          regnames.map(rn => `"if ${rn}"`).join(", ")
      };
    }

    if (completions.length === 1 && completions[0] === token) {
      const parsed = this.parseInstruction(
        remainder,
        `${completionPrefix}${token} `
      );
      if (parsed.kind === "success") {
        return {
          kind: "success",
          result: {
            condition: token as Register,
            subject: parsed.result
          }
        };
      }

      return parsed;
    }

    return {
      kind: "continue",
      completions: completions.map(cp => `${completionPrefix} ${cp}`),
      line: 0
    };
  }
}

// Reserved words are associated with a suggested alternative.
// If things change here, they'll need to change in
// commandlanguage.pegjs
export const reservedWords: { [key: string]: string } = {
  backward: "behind",
  create: "make",
  do: "perform",
  eat: "munch",
  end: "terminate",
  erase: "remove",
  finish: "complete",
  forward: "ahead",
  if: "on",
  left: "sinister",
  look: "see",
  mark: "spot",
  monster: "beast",
  no: "false",
  punch: "hit",
  repeat: "again",
  right: "correct",
  setmark: "makemark",
  touch: "tap",
  treasure: "goal",
  wall: "barrier",
  yes: "true"
};
