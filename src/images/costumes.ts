import _ from "lodash";
import { Rect, Orientation } from "../utils/geometry";
import { Tile } from "../levels/terrain";
import { CharacterType } from "../levels/levelstate";

import nothing from "./rltiles/nh-dngn_dark_part_of_a_room.png";
import deathMountainParadigmRoom from "./sprites/death_mountain_paradigm_room.png";

import hero from "./sprites/spaceman_overworld_64x64.png";
import heart from "./outfits/red_heart.png";

class ImageLoader {
  status: { [src: string]: boolean | null };
  resolvers: { resolve: Function; reject: Function } | undefined;

  constructor() {
    this.status = {};
  }

  public toImage(s: string) {
    if (this.resolvers) {
      throw Error("toImage() must be called before promise()");
    }

    this.status[s] = null;
    const ret = new Image();
    ret.onload = () => {
      this.status[s] = true;
      this.observeLoad();
    };
    ret.onerror = () => {
      this.status[s] = false;
      this.observeLoad();
    };
    ret.src = s;
    return ret;
  }

  public promise() {
    if (this.resolvers) {
      throw Error("promise() must be called no more than once");
    }

    const ret = new Promise((resolve, reject) => {
      this.resolvers = { resolve, reject };
    });

    this.observeLoad();
    return ret;
  }

  private observeLoad() {
    if (!this.resolvers) {
      return;
    }

    if (_.every(this.status)) {
      this.resolvers.resolve();
    }

    if (_.some(this.status, s => s === false)) {
      this.resolvers.reject();
    }
  }
}

const loader = new ImageLoader();

export interface ImageSprite {
  image: CanvasImageSource;
  sprite: Rect;
}

export function setting(t: Tile): ImageSprite {
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
    case Tile.northDoorway:
      return northDoorway;
    case Tile.eastDoorway:
      return eastDoorway;
    case Tile.southDoorway:
      return southDoorway;
    case Tile.westDoorway:
      return westDoorway;
    case Tile.northDoorWest:
      return northDoorWest;
    case Tile.northDoorEast:
      return northDoorEast;
    case Tile.southDoorWest:
      return southDoorWest;
    case Tile.southDoorEast:
      return southDoorEast;
    case Tile.eastDoorNorth:
      return eastDoorNorth;
    case Tile.eastDoorSouth:
      return eastDoorSouth;
    case Tile.westDoorNorth:
      return westDoorNorth;
    case Tile.westDoorSouth:
      return westDoorSouth;
    case Tile.northDoorframeWest:
      return northDoorframeWest;
    case Tile.northDoorframeEast:
      return northDoorframeEast;
    case Tile.southDoorframeWest:
      return southDoorframeWest;
    case Tile.southDoorframeEast:
      return southDoorframeEast;
    case Tile.eastDoorframeNorth:
      return eastDoorframeNorth;
    case Tile.eastDoorframeSouth:
      return eastDoorframeSouth;
    case Tile.westDoorframeNorth:
      return westDoorframeNorth;
    case Tile.westDoorframeSouth:
      return westDoorframeSouth;
    case Tile.northwestPointWall:
      return northwestPointWall;
    case Tile.northeastPointWall:
      return northeastPointWall;
    case Tile.southwestPointWall:
      return southwestPointWall;
    case Tile.southeastPointWall:
      return southeastPointWall;
  }

  throw Error(`unknown tile type ${t}`);
}

export function character(c: CharacterType, ot: Orientation) {
  return {
    image: characterImages[c]!,
    sprite: characterSprites[c][ot]!
  };
}

const characterImages = {
  [CharacterType.hero]: loader.toImage(hero),
  [CharacterType.heart]: loader.toImage(heart)
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
  image: loader.toImage(nothing),
  sprite: { top: 0, left: 0, width: 64, height: 64 }
};

const deathMountainImage = loader.toImage(deathMountainParadigmRoom);

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

const northDoorway = {
  image: deathMountainImage,
  sprite: { top: 640, left: 192, width: 64, height: 64 }
};

const eastDoorway = {
  image: deathMountainImage,
  sprite: { top: 192, left: 640, width: 64, height: 64 }
};

const southDoorway = {
  image: deathMountainImage,
  sprite: { top: 640, left: 128, width: 64, height: 64 }
};

const westDoorway = {
  image: deathMountainImage,
  sprite: { top: 128, left: 640, width: 64, height: 64 }
};

const northDoorframeWest = {
  image: deathMountainImage,
  sprite: { top: 640, left: 256, width: 64, height: 64 }
};

const northDoorframeEast = {
  image: deathMountainImage,
  sprite: { top: 640, left: 320, width: 64, height: 64 }
};

const southDoorframeWest = {
  image: deathMountainImage,
  sprite: { top: 640, left: 0, width: 64, height: 64 }
};

const southDoorframeEast = {
  image: deathMountainImage,
  sprite: { top: 640, left: 64, width: 64, height: 64 }
};

const westDoorframeNorth = {
  image: deathMountainImage,
  sprite: { top: 256, left: 640, width: 64, height: 64 }
};

const westDoorframeSouth = {
  image: deathMountainImage,
  sprite: { top: 320, left: 640, width: 64, height: 64 }
};

const eastDoorframeNorth = {
  image: deathMountainImage,
  sprite: { top: 0, left: 640, width: 64, height: 64 }
};

const eastDoorframeSouth = {
  image: deathMountainImage,
  sprite: { top: 64, left: 640, width: 64, height: 64 }
};

const northDoorWest = {
  image: deathMountainImage,
  sprite: { top: 0, left: 192, width: 64, height: 64 }
};

const northDoorEast = {
  image: deathMountainImage,
  sprite: { top: 0, left: 384, width: 64, height: 64 }
};

const southDoorWest = {
  image: deathMountainImage,
  sprite: { top: 576, left: 192, width: 64, height: 64 }
};

const southDoorEast = {
  image: deathMountainImage,
  sprite: { top: 576, left: 384, width: 64, height: 64 }
};

const westDoorNorth = {
  image: deathMountainImage,
  sprite: { top: 192, left: 0, width: 64, height: 64 }
};

const westDoorSouth = {
  image: deathMountainImage,
  sprite: { top: 384, left: 0, width: 64, height: 64 }
};

const eastDoorNorth = {
  image: deathMountainImage,
  sprite: { top: 192, left: 576, width: 64, height: 64 }
};

const eastDoorSouth = {
  image: deathMountainImage,
  sprite: { top: 384, left: 576, width: 64, height: 64 }
};

const northwestPointWall = {
  image: deathMountainImage,
  sprite: { top: 256, left: 256, width: 64, height: 64 }
};

const northeastPointWall = {
  image: deathMountainImage,
  sprite: { top: 256, left: 128, width: 64, height: 64 }
};

const southwestPointWall = {
  image: deathMountainImage,
  sprite: { top: 128, left: 256, width: 64, height: 64 }
};

const southeastPointWall = {
  image: deathMountainImage,
  sprite: { top: 128, left: 128, width: 64, height: 64 }
};

export const costumesLoaded = loader.promise();
