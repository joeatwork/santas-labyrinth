import React from "react";
import { connect } from "react-redux";

import { AllState } from "../state/states";
import { LevelState } from "../levels/levelstate";
import { Viewport, drawLevel } from "../renderer/renderer";

import "./GameScreen.css";

type GameScreenProps = {
  level?: LevelState;
};

export const GameScreen = connect((state: AllState) => ({
  level: "level" in state.game ? state.game.level : undefined
}))(({ level }: GameScreenProps) => {
  if (!level) {
    return null;
  }

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const checkPort = new Viewport(level, 12, 10);
  const renderSize = checkPort.renderSize();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const usePort = new Viewport(level, 12, 10);
    const ctx = canvas.getContext("2d")!;
    drawLevel(usePort, level, ctx);
  }, [level]);

  return (
    <div className="GameScreen-container">
      <canvas
        width={renderSize.width}
        height={renderSize.height}
        ref={canvasRef}
      />
    </div>
  );
});
