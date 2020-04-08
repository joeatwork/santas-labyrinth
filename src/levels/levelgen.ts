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
        [
          Tile.nothing,
          Tile.northWall,
          Tile.northWall,
          Tile.northWall,
          Tile.nothing
        ],
        [Tile.westWall, Tile.floor, Tile.floor, Tile.floor, Tile.eastWall],
        [Tile.westWall, Tile.floor, Tile.floor, Tile.floor, Tile.eastWall],
        [Tile.westWall, Tile.floor, Tile.floor, Tile.floor, Tile.eastWall],
        [
          Tile.nothing,
          Tile.southWall,
          Tile.southWall,
          Tile.southWall,
          Tile.nothing
        ]
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
  const { entrance, exit, terrain } = deathMountain(2, 2);

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
