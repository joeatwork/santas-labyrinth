import React from "react";
import { connect } from "react-redux";

import { AllState } from "../state/states";
import { LevelState } from "../levels/levelstate";
import { Tile, passable } from "../levels/terrain";
import { Rect } from "../utils/geometry";

function drawMap(
  mapScale: number,
  level: LevelState,
  renderRect: Rect,
  ctx: CanvasRenderingContext2D
) {
  const scanlineWidth = renderRect.width * mapScale;
  const image = ctx.createImageData(
    scanlineWidth,
    renderRect.height * mapScale
  );

  for (let offY = 0; offY < renderRect.height; offY++) {
    for (let offX = 0; offX < renderRect.width; offX++) {
      const tileX = offX + renderRect.left;
      const tileY = offY + renderRect.top;
      const tile = level.terrain.furniture[tileY][tileX];
      const mark = level.marks[tileY][tileX];

      if (!passable(tile)) {
        continue;
      }

      const baseImageX = tileX * mapScale;
      const baseImageY = tileY * mapScale;

      for (let dy = 0; dy < mapScale; dy++) {
        for (let dx = 0; dx < mapScale; dx++) {
          const imageX = baseImageX + dx;
          const imageY = baseImageY + dy;

          const imageSpot = imageY * scanlineWidth + imageX;
          const pixel = imageSpot * 4;
          image.data[pixel + 3] = 255; // alpha channel
        }
      }
    }
  }
  ctx.putImageData(image, 0, 0);
}

function interestingRect(furniture: Tile[][]): Rect {
  const renderRows = furniture
    .map(row => row.some(t => t !== Tile.nothing))
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p)
    .map(({ i }) => i);

  const renderCols = furniture
    .reduce((mask, row) => {
      return row.map((t, i) => mask[i] || t !== Tile.nothing);
    }, [])
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p)
    .map(({ i }) => i);

  const top = Math.min(...renderRows);
  const left = Math.min(...renderCols);
  const highY = Math.max(...renderRows);
  const highX = Math.max(...renderCols);

  return {
    top,
    left,
    width: highX - left,
    height: highY - top
  };
}

interface GameMapProps {
  width: number;
  level?: LevelState;
}

export const GameMap = connect(({ game }: AllState) => ({
  level: "level" in game ? game.level : undefined
}))(({ width, level }: GameMapProps) => {
  if (!level) {
    return null;
  }

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const renderRect = interestingRect(level.terrain.furniture);
  const mapScale = Math.floor(width / renderRect.width) || 1;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d")!;
    ctx.save();
    drawMap(mapScale, level, renderRect, ctx);
    ctx.restore();
  }, [mapScale, renderRect, level]);

  return (
    <div id="game_map">
      <canvas
        width={renderRect.width * mapScale}
        height={renderRect.height * mapScale}
        ref={canvasRef}
      />
    </div>
  );
});
