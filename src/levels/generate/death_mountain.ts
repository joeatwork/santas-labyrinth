import _ from "lodash";

import { Point } from "../../utils/geometry";
import { Terrain, Tile } from "../terrain";

// A hand-wave in the general direction of testability.
let sample = _.sample;

// mapHeight and mapWidth are sizes in rooms
// so roomGrid(3, 2) is a grid of 2 rows, 3 rooms across
function roomGrid(mapHeight: number, mapWidth: number): number[][] {
  const ret: number[][] = _.range(mapHeight * mapWidth).map(_ => []);
  ret.forEach((_, fromR) => {
    const fromY = Math.floor(fromR / mapWidth);
    const fromX = fromR - fromY * mapWidth;
    [
      [1, 0],
      [0, 1]
    ].forEach(([dx, dy]) => {
      const outX = fromX + dx;
      const outY = fromY + dy;
      if (outX < mapWidth && outY < mapHeight) {
        const toR = outY * mapWidth + outX;
        ret[fromR].push(toR);
        ret[toR].push(fromR);
      }
    });
  });

  return ret;
}

// Assumes bi-directional entries in paths.
// Returns some paths such that
// - Every path in the result is present in the paths argument
// - There is a path from start to end
// - the result paths are amusing to wander around in, for some values
//   of "amusing"
function maze(start: number, end: number, paths: number[][]): number[][] {
  const marks: Set<number>[] = paths.map(_ => new Set());
  const stack: number[] = [];

  const isMarked = (p1: number, p2: number) => {
    const check: [number, number] = [p1, p2];
    check.sort();
    return marks[check[0]].has(check[1]);
  };

  const makeMark = (p1: number, p2: number) => {
    const make: [number, number] = [p1, p2];
    make.sort();
    marks[make[0]].add(make[1]);
  };

  stack.push(start);
  while (stack.length && stack[stack.length - 1] !== end) {
    const at = stack[stack.length - 1];
    const exits = paths[at].filter(out => !isMarked(at, out));

    if (exits.length === 0) {
      stack.pop();
    } else {
      const out = sample(exits)!;
      makeMark(at, out);
      stack.push(out);
    }
  }

  const ret: number[][] = paths.map(_ => []);
  marks.forEach((toP, p1) => {
    toP.forEach(p2 => {
      ret[p1].push(p2);
      ret[p2].push(p1);
    });
  });

  return ret;
}

// Room size in tiles, including walls
const roomWidth = 12;
const roomHeight = 10;

// Returned rooms will be roomWidth x roomHeight
function deathMountainRoom(
  northDoor: boolean,
  eastDoor: boolean,
  southDoor: boolean,
  westDoor: boolean
): { furniture: Tile[][]; foreground: Tile[][] } {
  const x = Tile.nothing;

  const nw = Tile.northWall;
  const ew = Tile.eastWall;
  const sw = Tile.southWall;
  const ww = Tile.westWall;

  const nwc = Tile.northwestCornerWall;
  const nec = Tile.northeastCornerWall;
  const sec = Tile.southeastCornerWall;
  const swc = Tile.southwestCornerWall;

  const f = Tile.floor;

  const nd = northDoor ? Tile.northDoorway : nw;
  const ndw = northDoor ? Tile.northDoorWest : nw;
  const nde = northDoor ? Tile.northDoorEast : nw;

  const ed = eastDoor ? Tile.eastDoorway : ew;
  const edn = eastDoor ? Tile.eastDoorNorth : ew;
  const eds = eastDoor ? Tile.eastDoorSouth : ew;

  const sd = southDoor ? Tile.southDoorway : sw;
  const sdw = southDoor ? Tile.southDoorWest : sw;
  const sde = southDoor ? Tile.southDoorEast : sw;

  const wd = westDoor ? Tile.westDoorway : ww;
  const wdn = westDoor ? Tile.westDoorNorth : ww;
  const wds = westDoor ? Tile.westDoorSouth : ww;

  // prettier-ignore
  const furniture = [
    [nwc, nw, nw, nw, ndw, nd, nd, nde, nw, nw, nw, nec],
    [ ww,  f,  f,  f,   f,  f,  f,   f,  f,  f,  f,  ew],
    [ ww,  f,  f,  f,   f,  f,  f,   f,  f,  f,  f,  ew],
    [wdn,  f,  f,  f,   f,  f,  f,   f,  f,  f,  f, edn],
    [ wd,  f,  f,  f,   f,  f,  f,   f,  f,  f,  f,  ed],
    [ wd,  f,  f,  f,   f,  f,  f,   f,  f,  f,  f,  ed],
    [wds,  f,  f,  f,   f,  f,  f,   f,  f,  f,  f, eds],
    [ ww,  f,  f,  f,   f,  f,  f,   f,  f,  f,  f,  ew],
    [ ww,  f,  f,  f,   f,  f,  f,   f,  f,  f,  f,  ew],
    [swc, sw, sw, sw, sdw, sd, sd, sde, sw, sw, sw, sec]
  ];

  const ndfw = northDoor ? Tile.northDoorframeWest : x;
  const ndfe = northDoor ? Tile.northDoorframeEast : x;
  const edfn = eastDoor ? Tile.eastDoorframeNorth : x;
  const edfs = eastDoor ? Tile.eastDoorframeSouth : x;
  const sdfw = southDoor ? Tile.southDoorframeWest : x;
  const sdfe = southDoor ? Tile.southDoorframeEast : x;
  const wdfn = westDoor ? Tile.westDoorframeNorth : x;
  const wdfs = westDoor ? Tile.westDoorframeSouth : x;

  // prettier-ignore
  const foreground = [
    [   x, x, x, x, x, ndfw, ndfe, x, x, x, x,    x],
    [   x, x, x, x, x,    x,    x, x, x, x, x,    x],
    [   x, x, x, x, x,    x,    x, x, x, x, x,    x],
    [   x, x, x, x, x,    x,    x, x, x, x, x,    x],
    [wdfn, x, x, x, x,    x,    x, x, x, x, x, edfn],
    [wdfs, x, x, x, x,    x,    x, x, x, x, x, edfs],
    [   x, x, x, x, x,    x,    x, x, x, x, x,    x],
    [   x, x, x, x, x,    x,    x, x, x, x, x,    x],
    [   x, x, x, x, x,    x,    x, x, x, x, x,    x],
    [   x, x, x, x, x, sdfw, sdfe, x, x, x, x,    x]
  ];

  return { furniture, foreground };
}

function spliceInto<T>(dest: T[][], src: T[][], offset: Point) {
  src.forEach((srcRow, i) => {
    const destRow = dest[i + offset.y] || [];
    destRow.splice(offset.x, srcRow.length, ...srcRow);
    dest[i + offset.y] = destRow;
  });
}

export interface DeathMountainLevel {
  terrain: Terrain;
  entrance: Point;
  exit: Point;
}

// Death Mountain levels are a grid of
// uniformly sized rooms, with doors connecting
// them.
export function deathMountain(
  mapWidth: number,
  mapHeight: number
): DeathMountainLevel {
  const allDoors = roomGrid(mapWidth, mapHeight);

  const start = _.random(allDoors.length - 1);
  let end;
  do {
    end = _.random(allDoors.length - 1);
  } while (end === start);

  const mazeDoors = maze(start, end, allDoors);

  const furniture: Tile[][] = _.range(mapHeight * roomHeight).map(y => {
    return _.range(mapWidth * roomWidth).map(x => Tile.nothing);
  });

  const foreground: Tile[][] = furniture.map(row => [...row]);

  _.range(mapWidth * mapHeight).forEach(ix => {
    const doors = mazeDoors[ix];
    if (doors.length === 0 && ix !== start) {
      return;
    }

    const roomY = Math.floor(ix / mapWidth);
    const roomX = ix - roomY * mapWidth;

    let northDoor = false,
      southDoor = false,
      eastDoor = false,
      westDoor = false;
    doors.forEach(out => {
      const outY = Math.floor(out / mapWidth);
      const outX = out - outY * mapWidth;
      northDoor = northDoor || outY - roomY === -1;
      eastDoor = eastDoor || outX - roomX === 1;
      southDoor = southDoor || outY - roomY === 1;
      westDoor = westDoor || outX - roomX === -1;
    });

    const room = deathMountainRoom(northDoor, eastDoor, southDoor, westDoor);
    spliceInto(furniture, room.furniture, {
      x: roomX * roomWidth,
      y: roomY * roomHeight
    });
    spliceInto(foreground, room.foreground, {
      x: roomX * roomWidth,
      y: roomY * roomHeight
    });
  });

  const startRoomY = Math.floor(start / mapWidth);
  const startRoomX = start - startRoomY * mapWidth;

  const endRoomY = Math.floor(end / mapWidth);
  const endRoomX = end - endRoomY * mapWidth;

  return {
    entrance: {
      x: startRoomX * roomWidth + 5,
      y: startRoomY * roomHeight + 4
    },
    exit: {
      x: endRoomX * roomWidth + 3,
      y: endRoomY * roomHeight + 3
    },
    terrain: {
      furniture,
      foreground
    }
  };
}
