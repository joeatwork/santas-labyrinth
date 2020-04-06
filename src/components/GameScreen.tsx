import React from "react";
import { connect } from "react-redux";

import { AllState } from "../state/states";

import { Rect, rectIntersect } from "../utils/geometry";
import { Terrain } from "../levels/terrain";
import { LevelState, Actor, hero } from "../levels/levelstate";
import { furniture, character } from "../images/costumes";

import "./GameScreen.css";

const tileSize = (function() {
  return 64 / window.devicePixelRatio;
})();

function sliceToRect<T>(r: Rect, subject: T[][]) {
  return subject.slice(r.top, r.top + r.height).map(row => {
    return row.slice(r.left, r.left + r.width);
  });
}

function drawRoom(
  viewport: Rect,
  terrain: Terrain,
  ctx: CanvasRenderingContext2D
) {
  const screenSlice = sliceToRect(viewport, terrain.furniture);

  screenSlice.forEach((row, y) => {
    row.forEach((tile, x) => {
      ctx.drawImage(
        furniture(tile),
        tileSize * x,
        tileSize * y,
        tileSize,
        tileSize
      );
    });
  });
}

function drawMarks(
  viewport: Rect,
  marks: boolean[][],
  ctx: CanvasRenderingContext2D
) {
  const screenSlice = sliceToRect(viewport, marks);
  ctx.save();
  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;
  screenSlice.forEach((row, y) => {
    row.forEach((marked, x) => {
      if (marked) {
        ctx.strokeRect(tileSize * x, tileSize * y, tileSize, tileSize);
      }
    });
  });
  ctx.restore();
}

function drawActors(
  mapViewport: Rect,
  actors: Actor[],
  ctx: CanvasRenderingContext2D
) {
  actors.forEach(who => {
    const visible = rectIntersect(mapViewport, who.position);
    if (!visible) {
      return; // Actor is offscreen
    }

    const { image, sprite } = character(who.ctype, who.orientation);

    ctx.drawImage(
      image,
      sprite.left,
      sprite.top,
      sprite.width,
      sprite.height,
      tileSize * (who.position.left - mapViewport.left),
      tileSize * (who.position.top - mapViewport.top),
      tileSize * who.position.width,
      tileSize * who.position.height
    );
  });
}

type GameScreenProps = {
  game: LevelState;
};

export const GameScreen = connect((state: AllState) => ({ game: state.game }))(
  ({ game }: GameScreenProps) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const you = hero(game)!;

    const mapViewport = {
      top: Math.max(0, you.position.top - 3),
      left: Math.max(0, you.position.left - 3),
      width: 14,
      height: 10
    };

    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext("2d")!;
      ctx.save();
      drawRoom(mapViewport, game.terrain, ctx);
      drawMarks(mapViewport, game.marks, ctx);
      drawActors(mapViewport, game.actors, ctx);
      ctx.restore();
    }, [mapViewport, game]);

    return (
      <div className="GameScreen-container">
        <canvas
          width={mapViewport.width * tileSize}
          height={mapViewport.height * tileSize}
          style={{
            border: "1px solid black"
          }}
          ref={canvasRef}
        />
      </div>
    );
  }
);
