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
  const sprites = furniture(terrain);
  const screenSlice = sliceToRect(viewport, sprites);

  screenSlice.forEach((row, y) => {
    row.forEach((sp, x) => {
      ctx.drawImage(
        sp.image,
        sp.sprite.left,
        sp.sprite.top,
        sp.sprite.width,
        sp.sprite.height,
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
  const inset = 4;
  const screenSlice = sliceToRect(viewport, marks);
  ctx.save();
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  screenSlice.forEach((row, y) => {
    row.forEach((marked, x) => {
      if (marked) {
        ctx.strokeRect(
          tileSize * x + inset,
          tileSize * y + inset,
          tileSize - inset * 2,
          tileSize - inset * 2
        );
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
  loaded: boolean;
};

export const GameScreen = connect((state: AllState) => ({
  game: state.game,
  loaded: state.loaded
}))(({ loaded, game }: GameScreenProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const you = hero(game)!;

  const maxTop = game.terrain.furniture.length - 10;
  const maxLeft =
    Math.max(...game.terrain.furniture.map(row => row.length)) - 12;
  const mapViewport = {
    top: Math.min(maxTop, Math.max(0, you.position.top - 4)),
    left: Math.min(maxLeft, Math.max(0, you.position.left - 5)),
    width: 12,
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
  }, [loaded, mapViewport, game]);

  return (
    <div className="GameScreen-container">
      <canvas
        width={mapViewport.width * tileSize}
        height={mapViewport.height * tileSize}
        ref={canvasRef}
      />
    </div>
  );
});
