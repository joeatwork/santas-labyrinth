import React from "react";

import { Controls } from "../../components/Controls";
import { Feedback } from "../../components/Feedback";

import "./FreePlay.css";

export const FreePlay = () => {
  return (
    <div className="FreePlay-container">
      <div className="FreePlay-controls FreePlay-window">
        <Controls />
      </div>
      <div className="FreePlay-feedback FreePlay-window">
        <Feedback />
      </div>
    </div>
  );
};
