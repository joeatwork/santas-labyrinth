export enum Tile {
  nothing = "nothing",
  floor = "floor",
  wall = "wall",
  entrance = "entrance",
  exit = "exit"
}

export interface Terrain {
  furniture: Tile[][]; // [row y][column x]
}

export function inbounds(terr: Terrain, x: number, y: number) {
  return (
    y >= 0 &&
    y < terr.furniture.length &&
    x >= 0 &&
    x < terr.furniture[y].length &&
    passable(terr.furniture[y][x])
  );
}

export function passable(t: Tile) {
  return t !== Tile.nothing && t !== Tile.wall;
}
