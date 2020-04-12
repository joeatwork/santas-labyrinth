
export enum GameStateKind {
  "start",
  "level",
  "cutscene"
}

export const startGameState = {
  kind: GameStateKind.start
}

export interface StartGameState {
  readonly kind: GameStateKind.start
}

export interface LevelGameState {
  readonly kind: GameStateKind.level;
}

export interface CutsceneGameState {
  readonly kind: GameStateKind.cutscene;
}

export type GameState = StartGameState | LevelGameState | CutsceneGameState;
