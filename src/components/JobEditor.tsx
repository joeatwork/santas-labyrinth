import React from "react";
import { connect } from "react-redux";
import { Editor, EditorState } from "draft-js";
import classNames from "classnames/bind";

import { Actions } from "../state/actions";
import { AllState } from "../state/states";
import { CommandError, CommandErrorSite } from "../game/commandshell";
import { SourceCode } from "../editor/sourcecode";
import { LargeTooltip } from "../components/LargeTooltip";
import { SaveIcon } from "../components/icons/SaveIcon";
import { PlayIcon } from "../components/icons/PlayIcon";
import { StopIcon } from "../components/icons/StopIcon";

import "./JobEditor.css";

export type JobEditorParams = {
  playing: boolean;
  sourceToEdit: SourceCode;
  commandError: CommandError | null;
  onEdit: (ed: SourceCode) => void;
  onBuild: (source: SourceCode) => void;
  onPlay: (source: SourceCode) => void;
  onStop: () => void;
};

export const JobEditor = connect(
  (state: AllState) => ({
    playing: state.cpu.stack.length !== 0,
    cpu: state.cpu,
    commandError: state.commandError,
    sourceToEdit: state.sourceToEdit!
  }),
  dispatch => ({
    onEdit: (source: SourceCode) => {
      dispatch({
        type: Actions.editJob,
        source
      });
    },
    onBuild: (source: SourceCode) => {
      dispatch({
        type: Actions.buildJob,
        source
      });
    },
    onPlay: (source: SourceCode) => {
      dispatch({
        type: Actions.runJob,
        jobname: source.jobname
      });
    },
    onStop: () => {
      dispatch({
        type: Actions.halt
      });
    }
  })
)(
  ({
    playing,
    sourceToEdit,
    commandError,
    onEdit,
    onBuild,
    onPlay,
    onStop
  }: JobEditorParams) => {
    const showTip =
      commandError && commandError.site === CommandErrorSite.jobBody;

    const tooltip = commandError ? <div>{commandError.message}</div> : "";

    let button = "RUN";
    if (playing) {
      button = "HALT";
    } else if (sourceToEdit.dirty) {
      button = "SAVE";
    }

    const handleEditorChange = (editor: EditorState) => {
      const contentSame = sourceToEdit.editor
        .getCurrentContent()
        .equals(editor.getCurrentContent());

      onEdit({
        ...sourceToEdit,
        editor,
        dirty: sourceToEdit.dirty || !contentSame
      });
    };

    return (
      <div className="JobEditor-container">
        <div className="Controls-inputbox JobEditor-headerline">
          <div className="JobEditor-header">
            {sourceToEdit.jobname} {sourceToEdit.dirty ? "*" : ""}
          </div>
          {(() => {
            switch (button) {
              case "SAVE":
                return (
                  <button
                    className="JobEditor-button JobEditor-savebutton"
                    onClick={() => onBuild(sourceToEdit)}
                  >
                    Save
                  </button>
                );
              case "RUN":
                return (
                  <button
                    className="JobEditor-button JobEditor-runbutton"
                    onClick={() => onPlay(sourceToEdit)}
                  >
                    Run
                  </button>
                );
              case "HALT":
                return (
                  <button
                    className="JobEditor-button JobEditor-haltbutton"
                    onClick={onStop}
                  >
                    Halt
                  </button>
                );
            }
          })()}
        </div>
        <LargeTooltip show={!!showTip} tip={tooltip}>
          <div className="JobEditor-body">
            <Editor
              editorState={sourceToEdit.editor}
              onChange={handleEditorChange}
            />
          </div>
        </LargeTooltip>
      </div>
    );
  }
);
