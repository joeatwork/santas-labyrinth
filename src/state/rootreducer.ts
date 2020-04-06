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
import { hero } from "../levels/levelstate";
import { emptySource, getSourceText, annotateErrorLine } from "../editor/sourcecode";

const initialState: AllState = {
  game: levelGen(),
  cpu: newProcessor,
  lastTick: -1,
  terminalLine: "",
  commandError: null,
  completions: null,
  sourceToEdit: null,
  sourceLibrary: {}
};

export function rootReducer(
  state: AllState = initialState,
  action: AllActions
): AllState {
  switch (action.type) {
    // Robot actions
    case Actions.tick:
      const thisTick = Date.now();
      const stackBefore = state.cpu.stack.length;
      const up = continueExecution(
        state.lastTick,
        thisTick,
        hero(state.game),
        state.cpu,
        state.game
      );
      const retState = {
        ...state,
        ...up
      };
      if (stackBefore > 0 && retState.cpu.stack.length === 0) {
        return rootReducer(retState, {
          type: Actions.halt
        });
      }
      return retState;
    case Actions.halt:
      const halted = halt(state.cpu);
      return {
        ...state,
        ...halted,
        terminalLine: ""
      };
    // Interactive commands
    case Actions.newCommand:
      const ran = runCommand(
        action.command,
        hero(state.game),
        state.cpu,
        state.game
      );
      return {
        ...state,
        ...ran
      };
    // Editor actions
    case Actions.pickCreateNewJob:
      return {
        ...state,
        sourceToEdit: null
      };
    case Actions.createNewJob:
      const newjob = emptySource(action.jobname);
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
      // TODO this isn't right anymore.
      // We want MANY ERRORS, and a LOOSE BINDING between
      // Editor and CommandShell
      const txt = getSourceText(action.source);
      const defined = defineJob(state.cpu, action.source.jobname, txt);

      const source = annotateErrorLine(2, action.source);
      return {
        ...state,
        sourceLibrary: {
          ...state.sourceLibrary,
          [action.source.jobname]: source
        },
        sourceToEdit: {
          ...source,
          dirty: false // TODO not accurate! What if it's an error?
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
      return rootReducer(
        {
          ...state,
          terminalLine
        },
        {
          type: Actions.newCommand,
          command: terminalLine + "\n"
        }
      );
  }

  return state;
}
