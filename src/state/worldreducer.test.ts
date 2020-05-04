import { simpleLevel } from "../levels/levelgen";
import { hero } from "../levels/levelstate";
import { InstructionType } from "../robot/instructions";
import { newProcessor } from "../robot/processor";
import { Actions } from "../state/actions";
import { createSource } from "../editor/sourcecode";
import { worldReducer } from "../state/worldreducer";
import { GameStateKind } from "../game/gamestate";

const state0 = {
  cpu: {
    ...newProcessor,
    jobs: {
      testjob: {
        jobname: "testjob",
        work: [{ kind: InstructionType.forward }]
      }
    }
  },
  game: {
    kind: GameStateKind.composing,
    level: simpleLevel()
  },
  lastTick: 10,
  terminalLine: "",
  commandError: null,
  completions: null,
  sourceToEdit: null,
  sourceLibrary: {}
};

describe("halt", () => {
  const before = {
    ...state0,
    game: {
      kind: GameStateKind.running,
      level: state0.game.level
    },
    cpu: {
      ...state0.cpu,
      stack: [{ kind: "jobframe", jobname: "testjob", index: 0 }]
    }
  };

  const found = worldReducer(before, { type: Actions.halt });

  test("halt clears stack", () => {
    expect(found.cpu.stack).toEqual([]);
  });

  test("halt preserves level", () => {
    expect(found.game.level).toEqual(before.game.level);
  });
});

describe("tick", () => {
  const state = {
    ...state0,
    terminalLine: "present",
    game: {
      kind: GameStateKind.running,
      level: state0.game.level
    },
    cpu: {
      ...state0.cpu,
      stack: [{ kind: "jobframe", jobname: "haltjob", index: 0 }],
      jobs: {
        haltjob: {
          jobname: "haltjob",
          work: [{ kind: InstructionType.finish }]
        },
        advance: {
          jobname: "advance",
          work: [{ kind: InstructionType.forward }]
        }
      }
    }
  };

  test("terminal line clear", () => {
    const found = worldReducer(
      {
        ...state,
        cpu: {
          ...state.cpu,
          stack: [{ kind: "jobframe", jobname: "haltjob", index: 0 }]
        }
      },
      { type: Actions.tick },
      /* thisTick= */ 1000
    );

    expect(found.terminalLine).toEqual("");
  });

  test("instruction updates world", () => {
    const found = worldReducer(
      {
        ...state,
        cpu: {
          ...state.cpu,
          stack: [{ kind: "jobframe", jobname: "advance", index: 0 }]
        }
      },
      { type: Actions.tick },
      /* thisTick= */ 1000
    );

    expect(hero(found.game.level).position).toEqual({
      top: 2,
      left: 3,
      width: 1,
      height: 1
    });
  });
});

describe("buildJob", () => {
  test("job gets built", () => {
    const found = worldReducer(state0, {
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
  const before = {
    ...state0,
    game: {
      kind: GameStateKind.composing,
      level: state0.game.level
    },
    terminalLine: "exists"
  };

  const found = worldReducer(before, {
    type: Actions.newCommand,
    command: "forward\n"
  });

  test("simple task pushes stack", () => {
    expect(found.cpu.stack).toEqual([
      {
        kind: "immediate",
        instr: {
          kind: "forward"
        }
      }
    ]);
  });

  test("transition from composing to running", () => {
    expect(found.game.kind).toEqual(GameStateKind.running);
  });
});
