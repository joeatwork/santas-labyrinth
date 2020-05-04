import _ from "lodash";
import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import classNames from "classnames/bind";

import { AllState } from "../state/state";
import { Actions } from "../state/actions";
import { CommandError, CommandErrorSite } from "../game/commandshell";
import { GameStateKind } from "../game/gamestate";
import { Parser } from "../grammar/parser";
import { LargeTooltip, below } from "../components/LargeTooltip";

import "./Terminal.css";

export interface TerminalProps {
  gameState: GameStateKind;
  terminalLine: string;
  commandError: CommandError | null;
  completeCommand: (s: string) => string[];
  onEdit: (command: string) => void;
  onRun: (event: string) => void;
  onHalt: () => void;
}

export const Terminal = connect(
  ({ world }: AllState) => ({
    gameState: world.game.kind,
    terminalLine: world.terminalLine,
    commandError: world.commandError,
    completeCommand: (txt: string) => {
      const parser = new Parser(_.keys(world.cpu.jobs));
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
      dispatch({
        type: Actions.halt
      })
  })
)(
  ({
    gameState,
    terminalLine,
    commandError,
    completeCommand,
    onEdit,
    onRun,
    onHalt
  }: TerminalProps) => {
    const [focused, setFocused] = useState(false);
    const [wasComposing, setWasComposing] = useState(false);
    const fieldRef = useRef<HTMLInputElement>(null);
    const composing = gameState === GameStateKind.composing;

    useEffect(() => {
      if (!composing && focused && fieldRef.current) {
        fieldRef.current.blur();
      }

      if (composing && !wasComposing && fieldRef.current) {
        fieldRef.current.focus();
      }
      setWasComposing(composing);
    }, [composing, focused, wasComposing]);

    const paletteClick = (completion: string) => {
      if (completion[completion.length - 1] === "\n") {
        writeLine(completion);
      } else {
        if (fieldRef.current) {
          fieldRef.current.focus();
        }
        onEdit(completion);
      }
    };

    const writeLine = (toWrite: string) => {
      if (composing) {
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
    const show = focused && composing && (showError || completions.length);

    return (
      <div className="Terminal">
        <div className="Terminal-inputline">
          <LargeTooltip show={!!show} tip={tooltip} offset={below}>
            <div className="Terminal-inputbox Controls-inputbox">
              <input
                autoComplete="off"
                disabled={!composing}
                className="Terminal-inputfield Controls-inputfield"
                name="Terminal-inputfield"
                type="text"
                ref={fieldRef}
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
              {(() => {
                switch (gameState) {
                  case GameStateKind.composing:
                    return (
                      <button
                        className="Terminal-button Terminal-runButton"
                        onClick={() => writeLine(terminalLine + "\n")}
                      >
                        Run
                      </button>
                    );
                  case GameStateKind.running:
                    return (
                      <button
                        className="Terminal-button Terminal-haltButton"
                        onClick={() => onHalt()}
                      >
                        Halt
                      </button>
                    );
                  case GameStateKind.start:
                  case GameStateKind.cutscene:
                    return "";
                }
              })()}
            </div>
          </LargeTooltip>
        </div>
      </div>
    );
  }
);
