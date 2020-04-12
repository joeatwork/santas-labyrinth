export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export enum Orientation {
  north = "north",
  east = "east",
  south = "south",
  west = "west"
}

export function toDelta(ot: Orientation): Point {
  switch (ot) {
    case Orientation.north:
      return { x: 0, y: -1 };
    case Orientation.east:
      return { x: 1, y: 0 };
    case Orientation.south:
      return { x: 0, y: 1 };
    case Orientation.west:
      return { x: -1, y: 0 };
  }
}

export function clockwise(ot: Orientation) {
  switch (ot) {
    case Orientation.north:
      return Orientation.east;
    case Orientation.east:
      return Orientation.south;
    case Orientation.south:
      return Orientation.west;
    case Orientation.west:
      return Orientation.north;
  }
}

export function counterclockwise(ot: Orientation) {
  switch (ot) {
    case Orientation.north:
      return Orientation.west;
    case Orientation.west:
      return Orientation.south;
    case Orientation.south:
      return Orientation.east;
    case Orientation.east:
      return Orientation.north;
  }
}

export function rectIntersect(r1: Rect, r2: Rect) {
  const top = Math.max(r1.top, r2.top);
  const bottom = Math.min(r1.top + r1.height, r2.top + r2.height);
  const left = Math.max(r1.left, r2.left);
  const right = Math.min(r1.left + r1.width, r2.left + r2.width);

  if (top < bottom && left < right) {
    return {
      top,
      left,
      width: right - left,
      height: bottom - top
    };
  }
}
