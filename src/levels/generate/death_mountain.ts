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
): Tile[][] {
  const nw = Tile.northWall;
  const ew = Tile.eastWall;
  const sw = Tile.southWall;
  const ww = Tile.westWall;

  const nwc = Tile.northwestCornerWall;
  const nec = Tile.northeastCornerWall;
  const sec = Tile.southeastCornerWall;
  const swc = Tile.southwestCornerWall;

  const nwp = Tile.northwestPointWall;
  const nep = Tile.northeastPointWall;
  const sep = Tile.southeastPointWall;
  const swp = Tile.southwestPointWall;

  const f = Tile.floor;

  const nd = northDoor ? f : nw;
  const ndw = northDoor ? nwp : nw;
  const nde = northDoor ? nep : nw;

  const ed = eastDoor ? f : ew;
  const edn = eastDoor ? nep : ew;
  const eds = eastDoor ? sep : ew;

  const sd = southDoor ? f : sw;
  const sdw = southDoor ? swp : sw;
  const sde = southDoor ? sep : sw;

  const wd = westDoor ? f : ww;
  const wdn = westDoor ? nwp : ww;
  const wds = westDoor ? swp : ww;

  // prettier-ignore
  return [
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
export function deathMountain(mapWidth: number, mapHeight: number) {
  const allDoors = roomGrid(mapWidth, mapHeight);

  const start = _.random(allDoors.length - 1);
  let end;
  do {
    end = _.random(allDoors.length - 1);
  } while (end === start);

  const mazeDoors = maze(start, end, allDoors);

  const retTiles: Tile[][] = _.range(mapHeight * roomHeight).map(y => {
    return _.range(mapWidth * roomWidth).map(x => Tile.nothing);
  });

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
    spliceInto(retTiles, room, { x: roomX * roomWidth, y: roomY * roomHeight });
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
      furniture: retTiles
    }
  };
}
