import { GameState, GameStateKind, StartGameState } from "../game/gamestate";
import { levelGen } from "../levels/levelgen";

export const startGameState: StartGameState = {
  kind: GameStateKind.start
};

export function advanceScript(state: GameState): GameState {
  console.log("Advancing script ${state.kind} => ");
  switch (state.kind) {
    case GameStateKind.start:
    case GameStateKind.cutscene:
      return {
        kind: GameStateKind.composing,
        level: levelGen()
      };
    case GameStateKind.composing:
    case GameStateKind.running:
      return {
        kind: GameStateKind.cutscene,
        level: state.level
      };
  }
}
