import React from "react";
import { connect } from "react-redux";

import { AllState } from "../state/states";
import { GameStateKind } from "../game/gamestate";
import { RobotStatus } from "../components/RobotStatus";
import { GameScreen } from "../components/GameScreen";
import { Cutscene } from "../components/Cutscene";

interface FeedbackProps {
  gameState: GameStateKind;
}

export const Feedback = connect((s: AllState) => ({
  gameState: s.game.kind
}))(({ gameState }: FeedbackProps) => {
  return (
    <div className="Feedback-container">
      {(() => {
        switch (gameState) {
          case GameStateKind.composing:
          case GameStateKind.running:
            return (
              <div>
                <GameScreen />
                <RobotStatus />
              </div>
            );
          case GameStateKind.cutscene:
            return <Cutscene />;
          case GameStateKind.start:
            return <div>Loading ...</div>;
        }
      })()}
    </div>
  );
});
