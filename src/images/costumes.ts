import { Rect, Orientation } from "../utils/geometry";
import { Terrain, Tile, inbounds } from "../levels/terrain";
import { CharacterType } from "../levels/levelstate";

import nothing from "./rltiles/nh-dngn_dark_part_of_a_room.png";
import deathMountainParadigmRoom from "./sprites/death_mountain_paradigm_room.png";

import hero from "./sprites/spaceman_overworld_64x64.png";
import heart from "./outfits/red_heart.png";

export interface ImageSprite {
  image: CanvasImageSource;
  sprite: Rect;
}

export function furniture(terrain: Terrain): ImageSprite[][] {
  return terrain.furniture.map((row, y) =>
    row.map((t, x) => {
      switch (t) {
        case Tile.nothing:
          return nothingSprite;
        case Tile.floor:
          return floorSprite;
        case Tile.surroundedWall:
          return surroundedWall;
        case Tile.northwestCornerWall:
          return northwestCornerWall;
        case Tile.northeastCornerWall:
          return northeastCornerWall;
        case Tile.southwestCornerWall:
          return southwestCornerWall;
        case Tile.southeastCornerWall:
          return southeastCornerWall;
        case Tile.northWall:
          return northWall;
        case Tile.eastWall:
          return eastWall;
        case Tile.southWall:
          return southWall;
        case Tile.westWall:
          return westWall;
        case Tile.northwestPointWall:
          return northwestPointWall;
        case Tile.northeastPointWall:
          return northeastPointWall;
        case Tile.southwestPointWall:
          return southwestPointWall;
        case Tile.southeastPointWall:
          return southeastPointWall;
      }

      throw Error(`unknown tile type ${t} at ${x}, ${y}`);
    })
  );
}

export function character(c: CharacterType, ot: Orientation) {
  return {
    image: characterImages[c]!,
    sprite: characterSprites[c][ot]!
  };
}

function toImage(s: string) {
  const ret = new Image();
  ret.src = s;
  return ret;
}

const characterImages = {
  [CharacterType.hero]: toImage(hero),
  [CharacterType.heart]: toImage(heart)
};

export const characterSprites = {
  [CharacterType.hero]: {
    [Orientation.north]: { top: 0, left: 64, width: 64, height: 64 },
    [Orientation.east]: { top: 0, left: 640, width: 64, height: 64 },
    [Orientation.south]: { top: 0, left: 0, width: 64, height: 64 },
    [Orientation.west]: { top: 0, left: 128, width: 64, height: 64 }
  },
  [CharacterType.heart]: {
    [Orientation.north]: { top: 0, left: 0, width: 64, height: 64 },
    [Orientation.east]: { top: 0, left: 0, width: 64, height: 64 },
    [Orientation.south]: { top: 0, left: 0, width: 64, height: 64 },
    [Orientation.west]: { top: 0, left: 0, width: 64, height: 64 }
  }
};

const nothingSprite = {
  image: toImage(nothing),
  sprite: { top: 0, left: 0, width: 64, height: 64 }
};

const deathMountainImage = toImage(deathMountainParadigmRoom);

const floorSprite = {
  image: deathMountainImage,
  sprite: { top: 64, left: 64, width: 64, height: 64 }
};

const surroundedWall = {
  image: deathMountainImage,
  sprite: { top: 192, left: 192, width: 64, height: 64 }
};

const northwestCornerWall = {
  image: deathMountainImage,
  sprite: { top: 0, left: 0, width: 64, height: 64 }
};

const northeastCornerWall = {
  image: deathMountainImage,
  sprite: { top: 0, left: 576, width: 64, height: 64 }
};

const southwestCornerWall = {
  image: deathMountainImage,
  sprite: { top: 576, left: 0, width: 64, height: 64 }
};

const southeastCornerWall = {
  image: deathMountainImage,
  sprite: { top: 576, left: 576, width: 64, height: 64 }
};

const northWall = {
  image: deathMountainImage,
  sprite: { top: 0, left: 64, width: 64, height: 64 }
};

const southWall = {
  image: deathMountainImage,
  sprite: { top: 576, left: 64, width: 64, height: 64 }
};

const westWall = {
  image: deathMountainImage,
  sprite: { top: 64, left: 0, width: 64, height: 64 }
};

const eastWall = {
  image: deathMountainImage,
  sprite: { top: 64, left: 576, width: 64, height: 64 }
};

const northwestPointWall = {
  image: deathMountainImage,
  sprite: { top: 0, left: 192, width: 64, height: 64 }
};

const northeastPointWall = {
  image: deathMountainImage,
  sprite: { top: 0, left: 384, width: 64, height: 64 }
};

const southwestPointWall = {
  image: deathMountainImage,
  sprite: { top: 576, left: 192, width: 64, height: 64 }
};

const southeastPointWall = {
  image: deathMountainImage,
  sprite: { top: 576, left: 384, width: 64, height: 64 }
};

function chooseWallSprite(terrain: Terrain, x: number, y: number): ImageSprite {
  // prettier-ignore
  const points = [[y - 1, x - 1], [y - 1, x], [y - 1, x + 1],
                  [y,     x - 1],             [y,     x + 1],
                  [y + 1, x - 1], [y + 1, x], [y + 1, x + 1]];

  let mask = 0;
  points.forEach(([px, py], i) => {
    if (!inbounds(terrain, px, py)) {
      mask = mask | (128 >> i);
    }
  });

  console.log(
    `${x}, ${y}: ${terrain.furniture[y][x]} ${mask.toString(2)} ${mask ===
      0b11111110}`
  );
  console.dir(
    points.map(([px, py]) => {
      if (py < 0 || py >= terrain.furniture.length) {
        return undefined;
      }
      return terrain.furniture[py][px];
    })
  );
  switch (mask) {
    case 0b11111110:
      /*
        111
        1.1
        110
      */
      return northwestCornerWall;
  }

  const neighbors = mask & 0b01011010;

  switch (neighbors) {
    case 0b01011000:
      /*
       *1*
       1.1
       *0*
       */
      return northWall;
  }

  return nothingSprite;

  switch (mask) {
    case 0b11111111:
      /*
      111
      1.1
      111
      */
      return surroundedWall;
    case 0b11111011:
      /*
      111
      1.1
      011
      */
      return northeastCornerWall;
    case 0b11011111:
      /*
      110
      1.1
      111
      */
      return southwestCornerWall;
    case 0b01111111:
      /*
      011
      1.1
      111
      */
      return southeastCornerWall;
  }

  switch (neighbors) {
    case 0b01011000:
      /*
       *1*
       1.1
       *0*
       */
      return northWall;
    case 0b00011010:
      /*
       *0*
       1.1
       *1*
       */
      return southWall;
    case 0b01010010:
      /*
       *1*
       1.0
       *1*
       */
      return westWall;
    case 0b01001010:
      /*
       *1*
       0.1 - east wall
       *1*
       */
      return eastWall;
    case 0b01010000:
      /*
       *1*
       1.0
       *0*
       */
      return northwestPointWall;
    case 0b01001000:
      /*
       *1*
       0.1
       *0*
       */
      return northeastPointWall;
    case 0b00010010:
      /*
       *0*
       1.0
       *1*
       */
      return southwestPointWall;
    case 0b00001010:
      /*
       *0*
       0.1
       *1*
       */
      return southeastPointWall;
  }

  throw new Error(
    `Don't know how render wall sprite at ${x}, ${y} (tile ${
      terrain.furniture[y][x]
    }) (mask ${mask.toString(2)})`
  );
}
