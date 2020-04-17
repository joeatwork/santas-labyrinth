import { Point, Orientation } from "../utils/geometry";
import { InstructionType, Prop, Register } from "./instructions";
import { newProcessor, cycle, addJob, pushInstruction } from "./processor";

const newMock = () => {
  return {
    orders: [],
    saw: null,
    look: function(delta: Point): { what: Prop; where: number } | null {
      this.orders.push(["look", delta]);
      return this.saw;
    },
    orientation: function() {
      return Orientation.east;
    },
    eat: function(delta: Point) {
      this.orders.push(["eat", delta]);
    },
    punch: function(delta: Point) {
      this.orders.push(["punch", delta]);
    },
    turn: function(ot: Orientation) {
      this.orders.push(["turn", ot]);
    },
    go: function(delta: Point) {
      this.orders.push(["go", delta]);
    },
    setmark: function() {
      this.orders.push("setmark");
    },
    erase: function() {
      this.orders.push("erase");
    }
  };
};

const testJob = {
  jobname: "test job",
  work: [
    {
      // 0
      kind: InstructionType.eat
    },
    {
      // 1
      condition: Register.yes,
      subject: {
        kind: InstructionType.eat
      }
    },
    {
      // 2
      kind: InstructionType.look,
      prop: Prop.wall
    },
    {
      // 3
      kind: InstructionType.setmark
    },
    {
      // 4
      kind: InstructionType.left
    },
    {
      // 5
      kind: InstructionType.right
    },
    {
      // 6
      kind: InstructionType.forward
    },
    {
      // 7
      kind: InstructionType.backward
    },
    {
      // 8
      kind: InstructionType.punch
    },
    {
      // 9
      kind: InstructionType.touch,
      prop: Prop.wall
    },
    {
      // 10
      kind: InstructionType.erase
    },
    {
      // 11
      kind: InstructionType.repeat
    },
    {
      // 12
      kind: InstructionType.doit,
      jobname: "refname"
    },
    {
      // 13
      kind: InstructionType.finish
    },
    {
      // 14
      kind: InstructionType.erase
    }
  ]
};

test("pushInstruction", () => {
  const found = pushInstruction(
    { kind: InstructionType.forward },
    newProcessor
  );
  expect(found.stack).toEqual([
    {
      kind: "immediate",
      instr: {
        kind: InstructionType.forward
      }
    }
  ]);
});

describe("immediates", () => {
  let mock;
  beforeEach(() => {
    mock = newMock();
  });

  test("simple", () => {
    const pr = {
      ...newProcessor,
      stack: [{ kind: "immediate", instr: { kind: InstructionType.setmark } }]
    };
    cycle(pr, mock, mock);
    expect(mock.orders).toEqual(["setmark"]);
  });

  test("start job from immediate", () => {
    const pr = {
      ...newProcessor,
      stack: [
        {
          kind: "immediate",
          instr: { kind: InstructionType.doit, jobname: "test job" }
        }
      ]
    };
    const found = cycle(pr, mock, mock);
    expect(found.stack).toEqual([
      {
        kind: "jobframe",
        jobname: "test job",
        index: 0
      }
    ]);
  });

  test("repeat is a noop", () => {
    const pr = {
      ...newProcessor,
      stack: [{ kind: "immediate", instr: { kind: InstructionType.repeat } }]
    };
    const found = cycle(pr, mock, mock);
    expect(found.stack).toEqual([]);
  });
});

describe("cycle changes", () => {
  const pr = addJob(
    {
      registers: { yes: false, no: true },
      jobs: {},
      stack: []
    },
    testJob
  );

  let mock;
  beforeEach(() => {
    mock = newMock();
  });

  test("eat", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 0
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 1 }]
    });
  });
  test("condition fail", () => {
    const cond = {
      ...pr,
      registers: { yes: false, no: true }
    };
    cond.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 1
    };

    expect(cycle(cond, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 2 }]
    });
  });
  test("condition succeed", () => {
    const cond = {
      ...pr,
      registers: { yes: true, no: false }
    };
    cond.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 1
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 2 }]
    });
  });
  test("look find", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 2
    };
    mock.saw = { what: Prop.wall, where: 3 };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      registers: { yes: true, no: false },
      stack: [{ kind: "jobframe", jobname: "test job", index: 3 }]
    });
  });
  test("look find wrong", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 2
    };
    mock.saw = { what: Prop.treasure, where: 3 };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 3 }]
    });
  });
  test("look not find", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 2
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 3 }]
    });
  });
  test("setmark", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 3
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 4 }]
    });
  });
  test("left", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 4
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 5 }]
    });
  });
  test("right", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 5
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 6 }]
    });
  });
  test("forward", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 6
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 7 }]
    });
  });
  test("backward", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 7
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 8 }]
    });
  });
  test("punch", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 8
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 9 }]
    });
  });
  test("touch too far", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 9
    };
    mock.saw = { what: Prop.treasure, where: 3 };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 10 }]
    });
  });
  test("touch not find", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 9
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 10 }]
    });
  });
  test("touch wrong find", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 9
    };
    mock.saw = { what: Prop.treasure, where: 1 };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 10 }]
    });
  });
  test("touch find", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 9
    };
    mock.saw = { what: Prop.wall, where: 1 };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      registers: { yes: true, no: false },
      stack: [{ kind: "jobframe", jobname: "test job", index: 10 }]
    });
  });
  test("erase", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 10
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 11 }]
    });
  });
  test("repeat", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 11
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ kind: "jobframe", jobname: "test job", index: 0 }]
    });
  });
  test("finish", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 13
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: []
    });
  });
  test("do", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 12
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [
        {
          kind: "jobframe",
          jobname: "test job",
          index: 13
        },
        {
          kind: "jobframe",
          jobname: "refname",
          index: 0
        }
      ]
    });
  });

  test("run off the end of the job", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 14
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: []
    });
  });
});
describe("actuation", () => {
  const pr = addJob(
    {
      registers: { yes: false, no: true },
      jobs: {},
      stack: []
    },
    testJob
  );

  let mock;
  beforeEach(() => {
    mock = newMock();
  });

  test("eat", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 0
    };
    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["eat", { x: 1, y: 0 }]]);
  });
  test("condition fail", () => {
    const cond = {
      ...pr,
      registers: { yes: false, no: true }
    };
    cond.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 1
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([]);
  });
  test("condition succeed", () => {
    const cond = {
      ...pr,
      registers: { yes: true, no: false }
    };
    cond.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 1
    };

    cycle(cond, mock, mock);
    expect(mock.orders).toEqual([["eat", { x: 1, y: 0 }]]);
  });
  test("setmark", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 3
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual(["setmark"]);
  });
  test("left", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 4
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["turn", "north"]]);
  });
  test("right", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 5
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["turn", "south"]]);
  });
  test("forward", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 6
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["go", { x: 1, y: 0 }]]);
  });
  test("backward", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 7
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["go", { x: -1, y: 0 }]]);
  });
  test("punch", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 8
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["punch", { x: 1, y: 0 }]]);
  });
  test("erase", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 10
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual(["erase"]);
  });
  test("repeat", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 11
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([]);
  });
  test("finish", () => {
    pr.stack[0] = {
      kind: "jobframe",
      jobname: "test job",
      index: 13
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([]);
  });
});
