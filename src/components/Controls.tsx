import React from "react";
import { connect } from "react-redux";

import { WorldState } from "../state/world";
import { Terminal } from "../components/Terminal";
import { JobEditor } from "../components/JobEditor";
import { JobTabs } from "../components/JobTabs";
import { CreateJobForm } from "../components/CreateJobForm";

import "./Controls.css";

interface ControlsParams {
  editing: boolean;
}

export const Controls = connect((s: WorldState) => ({
  editing: s.sourceToEdit !== null
}))(({ editing }: ControlsParams) => {
  return (
    <div className="Controls-container">
      <div className="Controls-terminal">
        <div className="Controls-terminal-label-container">
          <div className="Controls-terminal-label">Command:</div>
        </div>
        <div className="Controls-terminal-form">
          <Terminal />
        </div>
      </div>
      <div className="Controls-jobdefs">
        <div className="Controls-jobdefs-tabs">
          <JobTabs />
        </div>
        <div className="Controls-jobdefs-forms">
          {editing ? <JobEditor /> : <CreateJobForm />}
        </div>
      </div>
    </div>
  );
});
