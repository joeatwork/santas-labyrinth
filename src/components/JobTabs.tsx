import _ from "lodash";
import React from "react";
import { connect } from "react-redux";
import classNames from "classnames/bind";

import { Actions } from "../state/actions";
import { WorldState } from "../state/world";
import { SourceCode } from "../editor/sourcecode";

import "./JobTabs.css";

interface JobTabsParams {
  sources: SourceCode[];
  sourceToEdit: SourceCode | null;
  onTabClicked: (source: SourceCode) => void;
  onNewJobClicked: () => void;
}

export const JobTabs = connect(
  (s: WorldState) => ({
    sources: _.values(s.sourceLibrary),
    sourceToEdit: s.sourceToEdit
  }),
  dispatch => ({
    onTabClicked: (source: SourceCode) =>
      dispatch({
        type: Actions.setEditJob,
        source
      }),
    onNewJobClicked: () =>
      dispatch({
        type: Actions.pickCreateNewJob
      })
  })
)(({ sources, sourceToEdit, onTabClicked, onNewJobClicked }: JobTabsParams) => {
  const selectedName = sourceToEdit?.jobname;

  return (
    <div className="JobTabs-container">
      {sources.map(source => (
        <div
          key={`tab-${source.jobname}`}
          className={classNames("JobTabs-tab", "JobTabs-pick", {
            "JobTabs-pick--selected": source.jobname === selectedName,
            "JobTabs-selectable": source.jobname !== selectedName
          })}
          onClick={() => onTabClicked(source)}
        >
          {source.jobname}
        </div>
      ))}
      <div
        className="JobTabs-tab JobTabs-create JobTabs-selectable"
        onClick={onNewJobClicked}
      >
        + New Job
      </div>
    </div>
  );
});
