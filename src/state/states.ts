import { LevelState } from "../levels/levelstate";
import { Processor } from "../robot/processor";
import { CommandError } from "../game/commandshell";
import { SourceCode } from "../editor/sourcecode";

export interface AllState {
  game: LevelState;
  cpu: Processor;
  lastTick: number;
  terminalLine: string;
  commandError: CommandError | null;
  completions: string[] | null;
  sourceToEdit: SourceCode | null;
  sourceLibrary: { [jobname: string]: SourceCode };
}
