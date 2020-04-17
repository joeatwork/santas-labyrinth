import { rectIntersect } from "../utils/geometry";
import { Tile, Terrain, terrainSize } from "../levels/terrain";
import { LevelState, Actor, hero } from "../levels/levelstate";
import { setting, character } from "../images/costumes";

const tileSize = (function() {
  return 64 / window.devicePixelRatio;
})();

export class Prerender {
  readonly background: CanvasImageSource;
  readonly foreground: CanvasImageSource;

  constructor(background: CanvasImageSource, foreground: CanvasImageSource) {
    this.background = background;
    this.foreground = foreground;
  }

  render(
    viewport: Viewport,
    marks: boolean[][],
    actors: Actor[],
    ctx: CanvasRenderingContext2D
  ) {
    const bgtop = viewport.top * tileSize;
    const bgleft = viewport.left * tileSize;
    const bgwidth = viewport.width * tileSize;
    const bgheight = viewport.height * tileSize;

    ctx.drawImage(
      this.background,
      bgleft,
      bgtop,
      bgwidth,
      bgheight,
      0,
      0,
      bgwidth,
      bgheight
    );
    drawMarks(viewport, marks, ctx);
    drawActors(viewport, actors, ctx);
    ctx.drawImage(
      this.foreground,
      bgleft,
      bgtop,
      bgwidth,
      bgheight,
      0,
      0,
      bgwidth,
      bgheight
    );
  }
}

export class Viewport {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;

  constructor(level: LevelState, width: number, height: number) {
    const you = hero(level)!;
    const lsize = terrainSize(level.terrain);

    const maxTop = lsize.height - 10;
    const maxLeft = lsize.width - 12;
    this.top = Math.min(maxTop, Math.max(0, you.position.top - 4));
    this.left = Math.min(maxLeft, Math.max(0, you.position.left - 5));
    this.width = width;
    this.height = height;
  }

  sliceTo<T>(subject: T[][]) {
    return subject.slice(this.top, this.top + this.height).map(row => {
      return row.slice(this.left, this.left + this.width);
    });
  }

  renderSize() {
    return {
      width: this.width * tileSize,
      height: this.height * tileSize
    };
  }
}

export function prerender(terrain: Terrain) {
  const lsize = terrainSize(terrain);

  const background = document.createElement("canvas");
  background.width = lsize.width * tileSize;
  background.height = lsize.height * tileSize;
  drawSetting(
    terrain.furniture,
    background.getContext("2d")! as CanvasRenderingContext2D
  );

  const foreground = document.createElement("canvas");
  foreground.width = lsize.width * tileSize;
  foreground.height = lsize.height * tileSize;
  const drawableForeground = terrain.foreground.map(row => {
    return row.map(t => (t === Tile.nothing ? null : t));
  });
  drawSetting(
    drawableForeground,
    foreground.getContext("2d") as CanvasRenderingContext2D
  );

  return new Prerender(background, foreground);
}

function drawSetting(tiles: (Tile | null)[][], ctx: CanvasRenderingContext2D) {
  const sprites = tiles.map(row =>
    row.map(t => {
      return t ? setting(t) : t;
    })
  );

  sprites.forEach((row, y) => {
    row.forEach((sp, x) => {
      if (!sp) {
        ctx.clearRect(tileSize * x, tileSize * y, tileSize, tileSize);
        return;
      }

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
  viewport: Viewport,
  marks: boolean[][],
  ctx: CanvasRenderingContext2D
) {
  const inset = 4;
  const screenSlice = viewport.sliceTo(marks);
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
  viewport: Viewport,
  actors: Actor[],
  ctx: CanvasRenderingContext2D
) {
  actors.forEach(who => {
    const visible = rectIntersect(viewport, who.position);
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
      tileSize * (who.position.left - viewport.left),
      tileSize * (who.position.top - viewport.top),
      tileSize * who.position.width,
      tileSize * who.position.height
    );
  });
}
