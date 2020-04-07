import React from "react";
import { connect } from "react-redux";

import { AllState } from "../state/states";
import { Terrain, Tile, passable } from "../levels/terrain";

function drawMap(
  mapScale: number,
  furniture: Tile[][],
  ctx: CanvasRenderingContext2D
) {
  const iHeight = furniture.length * mapScale;
  const iWidth = Math.max(...furniture.map(row => row.length)) * mapScale;
  const image = ctx.createImageData(iWidth, iHeight);

  furniture.forEach((row, tileY) => {
    row.forEach((tile, tileX) => {
      if (!passable(tile)) {
        return;
      }

      const baseImageX = tileX * mapScale;
      const baseImageY = tileY * mapScale;

      for (let dy = 0; dy < mapScale; dy++) {
        for (let dx = 0; dx < mapScale; dx++) {
          const imageX = baseImageX + dx;
          const imageY = baseImageY + dy;

          const imageSpot = imageY * iWidth + imageX;
          const pixel = imageSpot * 4;
          image.data[pixel + 3] = 255; // alpha channel
          switch (tile) {
            case Tile.entrance:
              image.data[pixel + 2] = 255;
              break;
            case Tile.exit:
              image.data[pixel + 1] = 255;
              break;
          }
        }
      }
    });
  });
  ctx.putImageData(image, 0, 0);
}

function stripTerrain(furniture: Tile[][]): Tile[][] {
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

  const lowY = Math.min(...renderRows);
  const lowX = Math.min(...renderCols);
  const highY = Math.max(...renderRows);
  const highX = Math.max(...renderCols);

  return furniture.slice(lowY, highY + 1).map(r => r.slice(lowX, highX + 1));
}

export const GameMap = connect((state: AllState) => ({
  terrain: state.game.terrain
}))(({ width, terrain }: { width: number; terrain: Terrain }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const stripped = stripTerrain(terrain.furniture);

  const tileCount = Math.max(...stripped.map(row => row.length));
  const mapScale = Math.floor(width / tileCount) || 1;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d")!;
    ctx.save();
    drawMap(mapScale, stripped, ctx);
    ctx.restore();
  }, [mapScale, stripped]);

  const lheight = stripped.length;
  return (
    <div id="game_map">
      <canvas
        width={tileCount * mapScale}
        height={lheight * mapScale}
        ref={canvasRef}
      />
    </div>
  );
});
