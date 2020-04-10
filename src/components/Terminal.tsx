import _ from "lodash";
import React, { useState } from "react";
import { connect } from "react-redux";
import classNames from "classnames/bind";

import { AllState } from "../state/states";
import { Actions } from "../state/actions";
import { CommandError, CommandErrorSite } from "../game/commandshell";
import { Parser } from "../grammar/parser";
import { LargeTooltip } from "../components/LargeTooltip";

import "./Terminal.css";

export interface TerminalProps {
  playing: boolean;
  terminalLine: string;
  commandError: CommandError | null;
  completeCommand: (s: string) => string[];
  onEdit: (command: string) => void;
  onRun: (event: string) => void;
  onHalt: () => void;
}

export const Terminal = connect(
  (state: AllState) => ({
    playing: state.cpu.stack.length !== 0,
    terminalLine: state.terminalLine,
    commandError: state.commandError,
    completeCommand: (txt: string) => {
      const parser = new Parser(_.keys(state.cpu.jobs));
      const result = parser.parseInstruction(txt);
      if (result.kind === "continue") {
        return result.completions;
      }

      return [];
    }
  }),
  dispatch => ({
    onEdit: (terminalLine: string) =>
      dispatch({
        type: Actions.editTerminalLine,
        terminalLine
      }),
    onRun: (command: string) =>
      dispatch({
        type: Actions.newCommand,
        command
      }),
    onHalt: () =>
      // TODO RENAME onHalt and onRun
      dispatch({
        type: Actions.halt
      })
  })
)(
  ({
    playing,
    terminalLine,
    commandError,
    completeCommand,
    onEdit,
    onRun,
    onHalt
  }: TerminalProps) => {
    const [focused, setFocused] = useState(false);

    const paletteClick = (completion: string) => {
      if (completion[completion.length - 1] === "\n") {
        writeLine(completion);
      } else {
        onEdit(completion);
      }
    };

    const writeLine = (toWrite: string) => {
      if (!playing) {
        onRun(toWrite);
      }
    };

    const errorMessage = <div>{commandError?.message}</div>;
    const completions = completeCommand(terminalLine);
    const palette = (
      <div className="Terminal-command-palette">
        {completions.map(w => {
          return (
            <span
              key={`palette-word-${w}`}
              className={classNames(
                "Terminal-palette-word",
                "Terminal-palette-word--enabled",
                { "Terminal-palette-word--exec": w[w.length - 1] === "\n" }
              )}
              onMouseDown={evt => evt.preventDefault()}
              onClick={() => paletteClick(w)}
            >
              {w}
            </span>
          );
        })}
      </div>
    );

    const tooltip = commandError ? errorMessage : palette;
    const showError =
      commandError && commandError.site === CommandErrorSite.command;
    const show = focused && !playing && (showError || completions.length);

    return (
      <div className="Terminal">
        <div className="Terminal-inputline">
          <LargeTooltip show={!!show} tip={tooltip}>
            <div className="Terminal-inputbox Controls-inputbox">
              <input
                autoComplete="off"
                disabled={playing}
                className="Terminal-inputfield Controls-inputfield"
                name="Terminal-inputfield"
                type="text"
                value={terminalLine}
                onChange={evt => {
                  onEdit(evt.target.value);
                }}
                onKeyUp={e => {
                  if (e.key === "Enter") {
                    writeLine(terminalLine + "\n");
                  }
                }}
                onFocus={() => {
                  setFocused(true);
                }}
                onBlur={() => {
                  setFocused(false);
                }}
              />{" "}
              {playing ? (
                <button
                  className="Terminal-button Terminal-haltButton"
                  onClick={() => onHalt()}
                >
                  Halt
                </button>
              ) : (
                <button
                  className="Terminal-button Terminal-runButton"
                  onClick={() => writeLine(terminalLine + "\n")}
                >
                  Run
                </button>
              )}
            </div>
          </LargeTooltip>
        </div>
      </div>
    );
  }
);
