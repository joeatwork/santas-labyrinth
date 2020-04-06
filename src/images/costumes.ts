import { Orientation } from "../utils/geometry";
import { Tile } from "../levels/terrain";
import { CharacterType } from "../levels/levelstate";

import nothing from "./rltiles/nh-dngn_dark_part_of_a_room.png";
import floor from "./rltiles/nh-dngn_floor_of_a_room.png";
import wall from "./rltiles/dc-dngn_dngn_rock_wall_07.png";
import entrance from "./rltiles/nh-dngn_staircase_up.png";
import exit from "./rltiles/nh-dngn_staircase_down.png";

import hero from "./sprites/spaceman_overworld_64x64.png";
import gremlin from "./rltiles/g_gremlin.png";

function toImage(s: string) {
  const ret = new Image();
  ret.src = s;
  return ret;
}

const furnitureImages = {
  [Tile.Nothing]: toImage(nothing),
  [Tile.Floor]: toImage(floor),
  [Tile.Wall]: toImage(wall),
  [Tile.Entrance]: toImage(entrance),
  [Tile.Exit]: toImage(exit)
};

const characterImages = {
  [CharacterType.Hero]: toImage(hero),
  [CharacterType.Goblin]: toImage(gremlin)
};

export const heroSpriteMap = {
  [Orientation.north]: { top: 0, left: 64, width: 64, height: 64 },
  [Orientation.east]: { top: 0, left: 640, width: 64, height: 64 },
  [Orientation.south]: { top: 0, left: 0, width: 64, height: 64 },
  [Orientation.west]: { top: 0, left: 128, width: 64, height: 64 }
};

export function furniture(t: Tile) {
  return furnitureImages[t]!;
}

export function character(c: CharacterType, ot: Orientation) {
  return { image: characterImages[c]!, sprite: heroSpriteMap[ot]! };
}
