import React from "react";
import { connect } from "react-redux";

import { AllState } from "../state/states";
import { Terminal } from "../components/Terminal";
import { JobEditor } from "../components/JobEditor";
import { JobTabs } from "../components/JobTabs";
import { CreateJobForm } from "../components/CreateJobForm";

import "./Controls.css";

interface ControlsParams {
  editing: boolean;
}

export const Controls = connect((s: AllState) => ({
  editing: s.sourceToEdit !== null
}))(({ editing }: ControlsParams) => {
  return (
    <div className="Controls-container">
      <div className="Controls-inset">
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
