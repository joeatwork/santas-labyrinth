import _ from "lodash";
import React, { useState } from "react";
import { connect } from "react-redux";

import { Actions } from "../state/actions";
import { AllState } from "../state/state";
import { LargeTooltip, rightEdge } from "../components/LargeTooltip";
import { validateJobName } from "../grammar/parser";

import "./CreateJobForm.css";

interface CreateJobFormParams {
  sourceLibrary: { [jobname: string]: any };
  onCreateJob: (jobname: string) => void;
}

export const CreateJobForm = connect(
  ({ world }: AllState) => _.pick(world, "sourceLibrary"),
  dispatch => ({
    onCreateJob: (jobname: string) =>
      dispatch({
        type: Actions.createNewJob,
        jobname
      })
  })
)(({ sourceLibrary, onCreateJob }: CreateJobFormParams) => {
  const [jobname, setJobName] = useState("");
  const [error, setError] = useState("");

  const tryCreateJob = () => {
    if (jobname in sourceLibrary) {
      setError(`"${jobname}" is already the name of a job.`);
      return;
    }

    const nameError = validateJobName(jobname);
    if (nameError) {
      setError(nameError);
      return;
    }

    setError("");
    onCreateJob(jobname);
  };

  const tooltip = <div>{error}</div>;

  return (
    <div className="CreateJobForm-container">
      <LargeTooltip show={error !== ""} tip={tooltip} offset={rightEdge}>
        <div className="Controls-inputbox CreateJobForm-inputbox">
          <input
            className="JobEditor-inputfield Controls-inputfield"
            name="JobEditor-inputfield"
            type="text"
            value={jobname}
            onChange={e => setJobName(e.target.value)}
            onKeyUp={e => {
              if (e.key === "Enter") {
                tryCreateJob();
              }
            }}
          />
          <button
            className="CreateJobForm-createbutton"
            onClick={e => tryCreateJob()}
          >
            Create
          </button>
        </div>
      </LargeTooltip>
    </div>
  );
});
