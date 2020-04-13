import React from "react";
import { connect } from "react-redux";

import { Actions } from "../state/actions";
import { RefreshIcon } from "../components/icons/RefreshIcon";

import "./Cutscene.css";

interface Cutscene {
  onRefreshClick: () => void;
}

export const Cutscene = connect(null, dispatch => ({
  onRefreshClick: () =>
    dispatch({
      type: Actions.cutsceneComplete
    })
}))(({ onRefreshClick }) => {
  return (
    <div className="Cutscene-container">
      <div className="Cutscene-body">
        <div className="Cutscene-greatjob">Great Job!</div>
        <div className="Cutscene-refresh" onClick={onRefreshClick}>
          Try again?
          <span className="Cutscene-refresh__icon">
            <RefreshIcon />
          </span>
        </div>
      </div>
    </div>
  );
});
