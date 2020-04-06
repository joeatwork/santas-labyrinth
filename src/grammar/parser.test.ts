import { ReferenceError } from "../grammar/errors";
import { Parser } from "../grammar/parser";
import { InstructionType, Prop } from "../robot/instructions";

const parser = new Parser(["jones"]);

describe("successes", () => {
  test("forward", () => {
    expect(parser.parseInstruction("forward\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.forward
      }
    });
  });

  test("backward", () => {
    expect(parser.parseInstruction("backward\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.backward
      }
    });
  });

  test("left", () => {
    expect(parser.parseInstruction("left\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.left
      }
    });
  });

  test("right", () => {
    expect(parser.parseInstruction("right\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.right
      }
    });
  });

  test("punch", () => {
    expect(parser.parseInstruction("punch\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.punch
      }
    });
  });

  test("setmark", () => {
    expect(parser.parseInstruction("setmark\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.setmark
      }
    });
  });

  test("erase", () => {
    expect(parser.parseInstruction("erase\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.erase
      }
    });
  });

  test("repeat", () => {
    expect(parser.parseInstruction("repeat\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.repeat
      }
    });
  });

  test("finish", () => {
    expect(parser.parseInstruction("finish\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.finish
      }
    });
  });

  test("touch", () => {
    expect(parser.parseInstruction("touch wall\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.touch,
        prop: Prop.wall
      }
    });
  });

  test("look", () => {
    expect(parser.parseInstruction("look wall\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.look,
        prop: Prop.wall
      }
    });
  });

  test("do job", () => {
    expect(parser.parseInstruction("do jones\n")).toEqual({
      kind: "success",
      result: {
        kind: InstructionType.doit,
        jobname: "jones"
      }
    });
  });

  test("if yes forward", () => {
    expect(parser.parseInstruction("if yes forward\n")).toEqual({
      kind: "success",
      result: {
        condition: "yes",
        subject: {
          kind: InstructionType.forward
        }
      }
    });
  });

  test("if yes if no forward", () => {
    expect(parser.parseInstruction("if yes if no forward\n")).toEqual({
      kind: "success",
      result: {
        condition: "yes",
        subject: {
          condition: "no",
          subject: {
            kind: InstructionType.forward
          }
        }
      }
    });
  });

  test("instruction list", () => {
    expect(
      parser.parseInstructionList(`
punch
do jones
  eat
`)
    ).toEqual({
      kind: "success",
      result: [
        { kind: InstructionType.punch },
        { kind: InstructionType.doit, jobname: "jones" },
        { kind: InstructionType.eat }
      ]
    });
  });
});

describe("errors", () => {
  test("no such prefix", () => {
    const found = parser.parseInstruction("gribbl\n");
    expect(found.kind).toEqual("fail");
    expect(found.message).toMatch(/gribbl/);
  });

  test("weird suffix", () => {
    const found = parser.parseInstruction("punch left\n");
    expect(found.kind).toEqual("fail");
    expect(found.message).toMatch(/left/);
  });

  test("weird prop", () => {
    const found = parser.parseInstruction("look jones\n");
    expect(found.kind).toEqual("fail");
    expect(found.message).toMatch(/jones/);
  });

  test("weird job", () => {
    const found = parser.parseInstruction("do left\n");
    expect(found.kind).toEqual("fail");
    expect(found.message).toMatch(/left/);
  });

  test("weird register name", () => {
    const found = parser.parseInstruction("if wall backward\n");
    expect(found.kind).toEqual("fail");
    expect(found.message).toMatch(/yes/);
  });

  test("missing prop", () => {
    const found = parser.parseInstruction("touch\n");
    expect(found.kind).toEqual("fail");
    expect(found.message).toMatch(/"wall"/);
  });

  test("missing job name", () => {
    const found = parser.parseInstruction("do \n");
    expect(found.kind).toEqual("fail");
    expect(found.message).toMatch(/"jones"/);
  });

  test("missing condition register", () => {
    const found = parser.parseInstruction("if \n");
    expect(found.kind).toEqual("fail");
    expect(found.message).toMatch(/"yes"/);
  });

  test("missing condition subject", () => {
    const found = parser.parseInstruction("if yes \n");
    expect(found.kind).toEqual("fail");
    expect(found.message).toMatch(/"forward"/);
  });
});
