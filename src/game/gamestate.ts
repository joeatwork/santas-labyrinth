import { LevelState } from "../levels/levelstate";

export enum GameStateKind {
  start = "start",
  composing = "composing",
  running = "running",
  cutscene = "cutscene"
}


export interface StartGameState {
  readonly kind: GameStateKind.start
}

export interface ComposingGameState {
  readonly kind: GameStateKind.composing,
  readonly level: LevelState
}

export interface RunningGameState {
  readonly kind: GameStateKind.running,
  readonly level: LevelState
}

export interface CutsceneGameState {
  readonly kind: GameStateKind.cutscene,
  readonly level: LevelState
}

export const startGameState:StartGameState = {
  kind: GameStateKind.start
}

export type GameState = StartGameState | ComposingGameState | RunningGameState | CutsceneGameState;
