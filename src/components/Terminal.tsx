import _ from "lodash";
import React, { useState } from "react";
import { connect } from "react-redux";
import classNames from "classnames/bind";

import { AllState } from "../state/states";
import { Actions } from "../state/actions";
import { CommandError, CommandErrorSite } from "../game/commandshell";
import { Parser } from "../grammar/parser";

import { LargeTooltip } from "../components/LargeTooltip";
import { PlayIcon } from "../components/icons/PlayIcon";
import { StopIcon } from "../components/icons/StopIcon";

import "./Terminal.css";

export interface TerminalProps {
  playing: boolean;
  terminalLine: string;
  commandError: CommandError | null;
  completeCommand: (s: string) => string[];
  onEdit: (command: string) => void;
  onPlay: (event: string) => void;
  onStop: () => void;
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
    onPlay: (command: string) =>
      dispatch({
        type: Actions.newCommand,
        command
      }),
    onStop: () =>
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
    onPlay,
    onStop
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
        onPlay(toWrite);
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
    const show = focused && (showError || completions.length);

    return (
      <div className="Terminal">
        <div
          className="Terminal-inputline"
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
          }}
        >
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
              />{" "}
              <div
                className={classNames("Terminal-playbutton", {
                  "Terminal-playbutton--enabled": !playing
                })}
                onClick={_ => writeLine(terminalLine + "\n")}
              >
                <PlayIcon />
              </div>
              <div
                className={classNames("Terminal-stopbutton", {
                  "Terminal-stopbutton--enabled": playing
                })}
                onClick={_ => {
                  if (playing) {
                    onStop();
                  }
                }}
              >
                <StopIcon />
              </div>
            </div>
          </LargeTooltip>
        </div>
      </div>
    );
  }
);
