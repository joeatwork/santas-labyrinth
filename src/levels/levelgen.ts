import { Orientation } from "../utils/geometry";
import { Tile, Terrain } from "./terrain";
import { deathMountain } from "./terraingen";
import { CharacterType } from "../levels/levelstate";

function searchTerrain(tr: Terrain, needle: Tile) {
  return tr.furniture.flatMap((row, y) => {
    return row
      .map((t, x) => {
        if (t === needle) {
          return { x, y };
        }
        return undefined;
      })
      .filter(p => p);
  });
}

export function levelGen() {
  const terrain = deathMountain();

  const entrance = searchTerrain(terrain, Tile.entrance)[0]!;

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
      }
    ]
  };
}
