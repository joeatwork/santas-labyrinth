import { SourceCode } from "../editor/sourcecode";

export enum Actions {
  loaded = "loaded",
  newCommand = "newCommand",
  buildJob = "buildJob",
  editJob = "editJob",
  runJob = "runJob",
  setEditJob = "setEditJob",
  pickCreateNewJob = "pickCreateNewJob",
  createNewJob = "createNewJob",
  editTerminalLine = "editTerminalLine",
  tick = "tick",
  halt = "halt"
}

export interface TickAction {
  type: Actions.tick;
}

export interface NewCommandAction {
  type: Actions.newCommand;
  command: string;
}

export interface EditJobAction {
  type: Actions.buildJob | Actions.editJob | Actions.setEditJob;
  source: SourceCode;
}

export interface NoContextAction {
  type: Actions.halt | Actions.pickCreateNewJob | Actions.loaded;
}

export interface CreateNewJobAction {
  type: Actions.createNewJob;
  jobname: string;
}

export interface RunJobAction {
  type: Actions.runJob;
  jobname: string;
}

export interface EditTerminalLineAction {
  type: Actions.editTerminalLine;
  terminalLine: string;
}

export type AllActions =
  | TickAction
  | NoContextAction
  | NewCommandAction
  | CreateNewJobAction
  | EditJobAction
  | EditTerminalLineAction
  | RunJobAction;
