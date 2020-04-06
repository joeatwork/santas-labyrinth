import { Point, Orientation } from "../utils/geometry";
import { InstructionType, Prop, Register } from "./instructions";
import { cycle, addJob } from "./processor";

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
      jobname: "test job",
      instruction: 0
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 1 }]
    });
  });
  test("condition fail", () => {
    const cond = {
      ...pr,
      registers: { yes: false, no: true }
    };
    cond.stack[0] = {
      jobname: "test job",
      instruction: 1
    };

    expect(cycle(cond, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 2 }]
    });
  });
  test("condition succeed", () => {
    const cond = {
      ...pr,
      registers: { yes: true, no: false }
    };
    cond.stack[0] = {
      jobname: "test job",
      instruction: 1
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 2 }]
    });
  });
  test("look find", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 2
    };
    mock.saw = { what: Prop.wall, where: 3 };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      registers: { yes: true, no: false },
      stack: [{ jobname: "test job", instruction: 3 }]
    });
  });
  test("look find wrong", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 2
    };
    mock.saw = { what: Prop.treasure, where: 3 };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 3 }]
    });
  });
  test("look not find", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 2
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 3 }]
    });
  });
  test("setmark", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 3
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 4 }]
    });
  });
  test("left", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 4
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 5 }]
    });
  });
  test("right", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 5
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 6 }]
    });
  });
  test("forward", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 6
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 7 }]
    });
  });
  test("backward", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 7
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 8 }]
    });
  });
  test("punch", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 8
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 9 }]
    });
  });
  test("touch too far", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 9
    };
    mock.saw = { what: Prop.treasure, where: 3 };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 10 }]
    });
  });
  test("touch not find", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 9
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 10 }]
    });
  });
  test("touch wrong find", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 9
    };
    mock.saw = { what: Prop.treasure, where: 0 };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 10 }]
    });
  });
  test("touch find", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 9
    };
    mock.saw = { what: Prop.wall, where: 0 };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      registers: { yes: true, no: false },
      stack: [{ jobname: "test job", instruction: 10 }]
    });
  });
  test("erase", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 10
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 11 }]
    });
  });
  test("repeat", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 11
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [{ jobname: "test job", instruction: 0 }]
    });
  });
  test("finish", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 13
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: []
    });
  });
  test("do", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 12
    };

    expect(cycle(pr, mock, mock)).toEqual({
      ...pr,
      stack: [
        {
          jobname: "test job",
          instruction: 13
        },
        {
          jobname: "refname",
          instruction: 0
        }
      ]
    });
  });

  test("run off the end of the job", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 14
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
      jobname: "test job",
      instruction: 0
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
      jobname: "test job",
      instruction: 1
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
      jobname: "test job",
      instruction: 1
    };

    cycle(cond, mock, mock);
    expect(mock.orders).toEqual([["eat", { x: 1, y: 0 }]]);
  });
  test("setmark", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 3
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual(["setmark"]);
  });
  test("left", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 4
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["turn", "north"]]);
  });
  test("right", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 5
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["turn", "south"]]);
  });
  test("forward", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 6
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["go", { x: 1, y: 0 }]]);
  });
  test("backward", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 7
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["go", { x: -1, y: 0 }]]);
  });
  test("punch", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 8
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([["punch", { x: 1, y: 0 }]]);
  });
  test("erase", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 10
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual(["erase"]);
  });
  test("repeat", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 11
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([]);
  });
  test("finish", () => {
    pr.stack[0] = {
      jobname: "test job",
      instruction: 13
    };

    cycle(pr, mock, mock);
    expect(mock.orders).toEqual([]);
  });
});
