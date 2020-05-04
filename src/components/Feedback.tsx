import React from "react";
import { connect } from "react-redux";

import { AllState } from "../state/state";
import { GameStateKind } from "../game/gamestate";
import { RobotStatus } from "../components/RobotStatus";
import { GameScreen } from "../components/GameScreen";
import { Cutscene } from "../components/Cutscene";

interface FeedbackProps {
  gameState: GameStateKind;
}

export const Feedback = connect(({ world }: AllState) => ({
  gameState: world.game.kind
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
