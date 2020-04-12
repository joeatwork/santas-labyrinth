
export enum GameStateKind {
  "start",
  "composing",
  "running",
  "cutscene"
}

export const startGameState = {
  kind: GameStateKind.start
}

export interface StartGameState {
  readonly kind: GameStateKind.start
}

export interface ComposingGameState {
  readonly kind: GameStateKind.composing
}

export interface RunningGameState {
  readonly kind: GameStateKind.running
}

export interface CutsceneGameState {
  readonly kind: GameStateKind.cutscene;
}

export type GameState = StartGameState | ComposingGameState | RunningGameState | CutsceneGameState;
