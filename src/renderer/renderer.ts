import { rectIntersect } from "../utils/geometry";
import { Tile } from "../levels/terrain";
import { LevelState, Actor, hero } from "../levels/levelstate";
import { setting, character } from "../images/costumes";

const tileSize = (function() {
  return 64 / window.devicePixelRatio;
})();

export class Viewport {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;

  constructor(level: LevelState, width: number, height: number) {
    const you = hero(level)!;

    const maxTop = level.terrain.furniture.length - 10;
    const maxLeft =
      Math.max(...level.terrain.furniture.map(row => row.length)) - 12;
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

export function drawLevel(
  viewport: Viewport,
  level: LevelState,
  ctx: CanvasRenderingContext2D
) {
  ctx.save();
  drawSetting(viewport, level.terrain.furniture, ctx);
  drawMarks(viewport, level.marks, ctx);
  drawActors(viewport, level.actors, ctx);

  const drawableForeground = level.terrain.foreground.map(row => {
    return row.map(t => (t === Tile.nothing ? null : t));
  });
  drawSetting(viewport, drawableForeground, ctx);
  ctx.restore();
}

function drawSetting(
  viewport: Viewport,
  tiles: (Tile | null)[][],
  ctx: CanvasRenderingContext2D
) {
  const sprites = tiles.map(row =>
    row.map(t => {
      return t ? setting(t) : t;
    })
  );
  const screenSlice = viewport.sliceTo(sprites);

  console.log(screenSlice);

  screenSlice.forEach((row, y) => {
    row.forEach((sp, x) => {
      if (!sp) {
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
