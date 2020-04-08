import _ from "lodash";

import { Orientation } from "../utils/geometry";
import { Tile } from "./terrain";
import { CharacterType } from "../levels/levelstate";
import { deathMountain } from "../levels/generate/death_mountain";

// Mostly useful for testing
export function simpleLevel() {
  return {
    terrain: {
      furniture: [
        [Tile.nothing, Tile.wall, Tile.wall, Tile.wall, Tile.nothing],
        [Tile.wall, Tile.floor, Tile.floor, Tile.floor, Tile.wall],
        [Tile.entrance, Tile.floor, Tile.floor, Tile.floor, Tile.wall],
        [Tile.wall, Tile.floor, Tile.floor, Tile.floor, Tile.wall],
        [Tile.nothing, Tile.wall, Tile.exit, Tile.wall, Tile.nothing]
      ]
    },
    marks: _.range(5).map(y => _.range(5).map(x => false)),
    actors: [
      {
        ctype: CharacterType.hero,
        orientation: Orientation.east,
        position: {
          top: 2,
          left: 2,
          width: 1,
          height: 1
        }
      },
      {
        ctype: CharacterType.heart,
        orientation: Orientation.south,
        position: {
          top: 1,
          left: 2,
          width: 1,
          height: 1
        }
      }
    ]
  };
}

export function levelGen() {
  const { entrance, exit, terrain } = deathMountain(6, 6);
  terrain.furniture[entrance.y][entrance.x] = Tile.entrance;

  return {
    terrain,
    marks: terrain.furniture.map(r => r.map(x => false)),
    actors: [
      {
        ctype: CharacterType.hero,
        orientation: Orientation.east,
        position: {
          top: entrance.y,
          left: entrance.x,
          width: 1,
          height: 1
        }
      },
      {
        ctype: CharacterType.heart,
        orientation: Orientation.south,
        position: {
          top: exit.y,
          left: exit.x,
          width: 1,
          height: 1
        }
      }
    ]
  };
}
