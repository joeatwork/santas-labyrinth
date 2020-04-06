// TODO lowercase Tiles
export enum Tile {
  Nothing = "Nothing",
  Floor = "Floor",
  Wall = "Wall",
  Entrance = "Entrance",
  Exit = "Exit"
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
  return t !== Tile.Nothing && t !== Tile.Wall;
}
