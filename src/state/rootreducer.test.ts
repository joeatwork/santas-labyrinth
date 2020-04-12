import { simpleLevel } from "../levels/levelgen";
import { InstructionType } from "../robot/instructions";
import { newProcessor } from "../robot/processor";
import { Actions } from "../state/actions";
import { createSource } from "../editor/sourcecode";
import { rootReducer } from "../state/rootreducer";

const state0 = {
  level: simpleLevel(),
  cpu: {
    ...newProcessor,
    jobs: {
      testjob: {
        jobname: "testjob",
        work: [{ kind: InstructionType.forward }]
      }
    }
  },
  lastTick: 10,
  terminalLine: "",
  commandError: null,
  completions: null,
  sourceToEdit: null,
  sourceLibrary: {}
};

describe("tick", () => {
  test("stack and terminal clear together", () => {
    const found = rootReducer(
      {
        ...state0,
        terminalLine: "present",
        cpu: {
          ...state0.cpu,
          stack: [{ kind: "jobframe", jobname: "haltjob", index: 0 }],
          jobs: {
            haltjob: {
              jobname: "haltjob",
              work: [{ kind: InstructionType.finish }]
            }
          }
        }
      },
      { type: Actions.tick },
      /* thisTick= */ 1000
    );

    expect(found.terminalLine).toEqual("");
  });
});

describe("buildJob", () => {
  test("job gets built", () => {
    const found = rootReducer(state0, {
      type: Actions.buildJob,
      source: createSource("newjob", "forward\n")
    });
    expect(found.cpu.jobs["newjob"]).toEqual({
      jobname: "newjob",
      work: [{ kind: InstructionType.forward }]
    });
  });
});

describe("newCommand", () => {
  test("simple task pushes stack", () => {
    const found = rootReducer(
      {
        ...state0,
        terminalLine: "exists"
      },
      {
        type: Actions.newCommand,
        command: "forward\n"
      }
    );
    expect(found.cpu.stack).toEqual([
      {
        kind: "immediate",
        instr: {
          kind: "forward",
        }
      }
    ]);
  });
});
