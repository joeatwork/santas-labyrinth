import React from "react";
import { connect } from "react-redux";

import { AllState } from "../state/states";
import { Terrain, Tile, passable } from "../levels/terrain";

const mapScale = 2; // Each tile is a mapScale x mapScale block

function drawMap(terrain: Terrain, ctx: CanvasRenderingContext2D) {
  const iHeight = terrain.furniture.length * mapScale;
  const iWidth =
    Math.max(...terrain.furniture.map(row => row.length)) * mapScale;
  const image = ctx.createImageData(iWidth, iHeight);

  terrain.furniture.forEach((row, tileY) => {
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
            case Tile.Entrance:
              image.data[pixel + 2] = 255;
              break;
            case Tile.Exit:
              image.data[pixel + 1] = 255;
              break;
          }
        }
      }
    });
  });
  ctx.putImageData(image, 0, 0);
}

export const GameMap = connect((state: AllState) => ({
  terrain: state.game.terrain
}))(({ terrain }: { terrain: Terrain }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d")!;
    ctx.save();
    drawMap(terrain, ctx);
    ctx.restore();
  }, [terrain]);

  const lheight = terrain.furniture.length;
  const lwidth = Math.max(...terrain.furniture.map(row => row.length));
  return (
    <div id="game_map">
      <canvas
        width={lwidth * mapScale}
        height={lheight * mapScale}
        ref={canvasRef}
        style={{ border: "1px solid black" }}
      />
    </div>
  );
});
