import { newProcessor } from "../robot/processor";
import { Actions, AllActions } from "./actions";
import { WorldState } from "./world";
import {
  runCommand,
  defineJob,
  continueExecution,
  halt
} from "../game/commandshell";
import { GameStateKind } from "../game/gamestate";
import { advanceScript, startGameState } from "../game/script";
import { victory, running, halted } from "../game/triggers";
import { hero } from "../levels/levelstate";
import {
  createSource,
  getSourceText,
  annotateErrors
} from "../editor/sourcecode";

const initialState: WorldState = {
  cpu: newProcessor,
  lastTick: -1,
  game: startGameState,
  terminalLine: "",
  commandError: null,
  completions: null,
  sourceToEdit: null,
  sourceLibrary: {}
};

export function rootReducer(
  state: WorldState = initialState,
  action: AllActions,
  thisTick: number | undefined = undefined
) {
  let ret = reduction(state, action, thisTick);

  if (running(state.cpu, ret.cpu)) {
    if (!("level" in state.game)) {
      throw Error(`illegal transition, from ${state.game.kind} to running`);
    }
    ret = {
      ...ret,
      game: {
        kind: GameStateKind.running,
        level: state.game.level
      }
    };
  }

  if (halted(state.cpu, ret.cpu)) {
    if (!("level" in ret.game)) {
      throw Error(
        `illegal transition, from ${state.game.kind} to composing via halt`
      );
    }
    ret = {
      ...ret,
      game: {
        kind: GameStateKind.composing,
        level: ret.game.level
      },
      terminalLine: ""
    };
  }

  if (victory(ret.game)) {
    ret = {
      ...ret,
      ...halt(ret.cpu), // TODO script should own CPU
      game: advanceScript(ret.game)
    };
  }

  return ret;
}

function reduction(
  state: WorldState,
  action: AllActions,
  thisTick: number | undefined
): WorldState {
  switch (action.type) {
    case Actions.loaded:
    case Actions.cutsceneComplete:
      return {
        ...state,
        game: advanceScript(state.game)
      };
    case Actions.tick:
      if (state.game.kind !== GameStateKind.running) {
        return state;
      }
      thisTick = thisTick || Date.now();
      const up = continueExecution(
        state.lastTick,
        thisTick,
        hero(state.game.level),
        state.cpu,
        state.game.level
      );
      const tickRet = {
        ...state,
        ...up
      };
      return tickRet;
    case Actions.halt:
      if (state.game.kind !== GameStateKind.running) {
        return state;
      }
      return {
        ...state,
        ...halt(state.cpu)
      };
    case Actions.newCommand:
      if (state.game.kind !== GameStateKind.composing) {
        return state;
      }
      const ran = runCommand(
        action.command,
        hero(state.game.level),
        state.cpu,
        state.game.level
      );
      return {
        ...state,
        ...ran
      };
    case Actions.pickCreateNewJob:
      return {
        ...state,
        sourceToEdit: null
      };
    case Actions.createNewJob:
      const newjob = createSource(action.jobname, "");
      return {
        ...state,
        sourceLibrary: {
          ...state.sourceLibrary,
          [action.jobname]: newjob
        },
        sourceToEdit: newjob
      };
    case Actions.setEditJob:
      return {
        ...state,
        sourceToEdit: action.source
      };
    case Actions.buildJob:
      const txt = getSourceText(action.source);
      const defined = defineJob(state.cpu, action.source.jobname, txt);
      let dirty = false;
      let errlines: number[] = [];
      if (defined.commandError && defined.commandError.line >= 0) {
        dirty = true;
        errlines = [defined.commandError.line];
      }
      const source = annotateErrors(action.source, errlines);
      return {
        ...state,
        sourceLibrary: {
          ...state.sourceLibrary,
          [action.source.jobname]: source
        },
        sourceToEdit: {
          ...source,
          dirty
        },
        ...defined
      };
    case Actions.editTerminalLine:
      return {
        ...state,
        terminalLine: action.terminalLine
      };
    case Actions.editJob:
      return {
        ...state,
        sourceToEdit: action.source
      };
    case Actions.runJob:
      const terminalLine = `do ${action.jobname}`;
      return reduction(
        {
          ...state,
          terminalLine
        },
        {
          type: Actions.newCommand,
          command: terminalLine + "\n"
        },
        undefined
      );
  }

  return state;
}
