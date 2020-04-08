export enum Tile {
  nothing = "nothing",
  floor = "floor",
  surroundedWall = "surroundedWall",
  northwestCornerWall = "northwestCornerWall",
  northeastCornerWall = "northeastCornerWall",
  southwestCornerWall = "southwestCornerWall",
  southeastCornerWall = "southeastCornerWall",
  northWall = "northWall",
  eastWall = "eastWall",
  southWall = "southWall",
  westWall = "westWall",
  northwestPointWall = "northwestPointWall",
  northeastPointWall = "northeastPointWall",
  southwestPointWall = "southwestPointWall",
  southeastPointWall = "southeastPointWall"
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

const impassable = {
  nothing: true,
  surroundedWall: true,
  northwestCornerWall: true,
  northeastCornerWall: true,
  southwestCornerWall: true,
  southeastCornerWall: true,
  northWall: true,
  eastWall: true,
  southWall: true,
  westWall: true,
  northwestPointWall: true,
  northeastPointWall: true,
  southwestPointWall: true,
  southeastPointWall: true
};

export function passable(t: Tile) {
  return !(t in impassable);
}
