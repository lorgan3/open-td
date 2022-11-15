import { mod } from "./math";

// https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
export const getRayDistance = (
  rayX: number,
  rayY: number,
  rayDirection: number,
  pointX: number,
  pointY: number
) => {
  // Only consider points that are 'in front' of the ray
  const direction = Math.atan2(pointY - rayY, pointX - rayX);
  let diff = mod(direction - rayDirection + Math.PI, Math.PI * 2) - Math.PI;
  if (Math.abs(diff) >= Math.PI) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.abs(
    Math.cos(rayDirection) * (rayY - pointY) -
      Math.sin(rayDirection) * (rayX - pointX)
  );
};

export const getSquareDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  return (x1 - x2) ** 2 + (y1 - y2) ** 2;
};
