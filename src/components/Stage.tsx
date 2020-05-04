import React from "react";

import { Controls } from "../components/Controls";
import { Feedback } from "../components/Feedback";

export const Stage = () => {
  return (
    <div className="App-universe">
      <div className="App-controls App-window">
        <Controls />
      </div>
      <div className="App-feedback App-window">
        <Feedback />
      </div>
    </div>
  );
};
