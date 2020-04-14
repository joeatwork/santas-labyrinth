export enum Tile {
  nothing = "nothing",
  floor = "floor",
  northDoorway = "northDoorway",
  southDoorway = "southDoorway",
  eastDoorway = "eastDoorway",
  westDoorway = "westDoorway",
  surroundedWall = "surroundedWall",
  northwestCornerWall = "northwestCornerWall",
  northeastCornerWall = "northeastCornerWall",
  southwestCornerWall = "southwestCornerWall",
  southeastCornerWall = "southeastCornerWall",
  northWall = "northWall",
  eastWall = "eastWall",
  southWall = "southWall",
  westWall = "westWall",
  northDoorWest = "northDoorWest",
  northDoorEast = "northDoorEast",
  southDoorWest = "southDoorWest",
  southDoorEast = "southDoorEast",
  westDoorNorth = "westDoorNorth",
  westDoorSouth = "westDoorSouth",
  eastDoorNorth = "eastDoorNorth",
  eastDoorSouth = "eastDoorSouth",
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

const passableTiles = {
  floor: true,
  northDoorway: true,
  southDoorway: true,
  eastDoorway: true,
  westDoorway: true
};

export function passable(t: Tile) {
  return t in passableTiles;
}
