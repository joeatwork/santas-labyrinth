import { Orientation } from "../utils/geometry";
import { Tile } from "./terrain";
import { CharacterType } from "../levels/levelstate";
import { deathMountain } from "../levels/generate/death_mountain";

export function levelGen() {
  const { entrance, exit, terrain } = deathMountain(2, 2);
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
