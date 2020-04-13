import { LevelState } from "../levels/levelstate";
import { Processor } from "../robot/processor";
import { CommandError } from "../game/commandshell";
import { GameState } from "../game/gamestate";
import { SourceCode } from "../editor/sourcecode";

export interface AllState {
  // Meta
  loaded: boolean; // TODO move to GameState

  // Game world
  cpu: Processor;
  lastTick: number;

  // Game progression
  game: GameState;

  // Editor
  terminalLine: string;
  commandError: CommandError | null;
  completions: string[] | null;
  sourceToEdit: SourceCode | null;
  sourceLibrary: { [jobname: string]: SourceCode };
}
