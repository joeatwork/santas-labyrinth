import React from "react";
import { connect } from "react-redux";

import { AllState } from "../state/state";
import { Terrain } from "../levels/terrain";
import { LevelState } from "../levels/levelstate";
import { Viewport, Prerender, prerender } from "../renderer/renderer";

import "./GameScreen.css";

type PrerendererProps = {
  terrain?: Terrain;
};

type GameScreenProps = {
  prerendered: Prerender;
  level?: LevelState;
};

export const GameScreen = connect(({ world }: AllState) => ({
  terrain: "level" in world.game ? world.game.level.terrain : undefined
}))(({ terrain }: PrerendererProps) => {
  if (!terrain) {
    return null;
  }

  return <EachRender prerendered={prerender(terrain)} />;
});

const EachRender = connect(({ world }: AllState) => ({
  level: "level" in world.game ? world.game.level : undefined
}))(({ level, prerendered }: GameScreenProps) => {
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
    prerendered.render(usePort, level.marks, level.actors, ctx);
  }, [level, prerendered]);

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
