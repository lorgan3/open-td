import Tile, { TileType } from "./tile";
import SimplexNoise from "simplex-noise";

export type Generator = (x: number, y: number) => Tile;

const simplex = new SimplexNoise(0);

const SCALE = 0.048;
const RIVER_SCALE = 0.0093;
const RIVER_THRESHOLD = 0.92;

const generate: Generator = (x, y) => {
  const biome = simplex.noise2D(x * SCALE, y * SCALE);
  const river =
    1.0 - Math.abs(simplex.noise2D(x * RIVER_SCALE, y * RIVER_SCALE));

  if (river > RIVER_THRESHOLD) {
    return new Tile(x, y, TileType.Water);
  }

  if (biome > -0.7) {
    return new Tile(x, y, TileType.Grass);
  } else {
    return new Tile(x, y, TileType.Stone);
  }
};

export default generate;
