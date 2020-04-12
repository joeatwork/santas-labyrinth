import { newProcessor } from "../robot/processor";
import { Actions, AllActions } from "./actions";
import { AllState } from "./states";
import { levelGen } from "../levels/levelgen";
import {
  runCommand,
  defineJob,
  continueExecution,
  halt
} from "../game/commandshell";
import { startGameState, GameStateKind } from "../game/gamestate";
import { victory, running, halted } from "../game/triggers";
import { hero } from "../levels/levelstate";
import {
  createSource,
  getSourceText,
  annotateErrors
} from "../editor/sourcecode";

const initialState: AllState = {
  loaded: false,
  level: levelGen(),
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
  state: AllState = initialState,
  action: AllActions,
  thisTick: number | undefined = undefined
) {
  let ret = reduction(state, action, thisTick);

  if (ret.loaded && !state.loaded) {
    ret = {
      ...ret,
      game: { kind: GameStateKind.composing }
    };
  }

  if (running(state.cpu, ret.cpu)) {
    ret = {
      ...ret,
      game: { kind: GameStateKind.running }
    };
  }

  if (halted(state.cpu, ret.cpu)) {
    ret = {
      ...ret,
      game: { kind: GameStateKind.composing },
      terminalLine: ""
    };
  }

  if (victory(ret.level)) {
    ret = {
      ...ret,
      game: { kind: GameStateKind.cutscene }
    };
  }

  return ret;
}

function reduction(
  state: AllState,
  action: AllActions,
  thisTick: number | undefined
): AllState {
  switch (action.type) {
    case Actions.loaded:
      return {
        ...state,
        game: { kind: GameStateKind.composing },
        loaded: true
      };
    case Actions.tick:
      if (state.game.kind !== GameStateKind.running) {
        return state;
      }
      thisTick = thisTick || Date.now();
      const up = continueExecution(
        state.lastTick,
        thisTick,
        hero(state.level),
        state.cpu,
        state.level
      );
      return {
        ...state,
        ...up
      };
    case Actions.halt:
      return {
        ...state,
        ...halt(state.cpu)
      };
    case Actions.newCommand:
      const ran = runCommand(
        action.command,
        hero(state.level),
        state.cpu,
        state.level
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
    case Actions.victoryTrigger:
      return {
        ...reduction(state, { type: Actions.halt }, undefined),
        game: { kind: GameStateKind.cutscene }
      };
  }

  return state;
}
