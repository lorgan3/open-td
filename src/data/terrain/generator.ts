import Tile, { TileType } from "./tile";
import SimplexNoise from "simplex-noise";
import Tree from "../entity/Tree";
import Rock from "../entity/Rock";

export type Generator = (x: number, y: number) => Tile;

const simplex = new SimplexNoise(0);

const SCALE = 0.048;
const MOISTURE_SCALE = 0.0077;
const TEMPERATURE_SCALE = 0.0025;
const HEIGHT_SCALE = 0.0194;

const RIVER_THRESHOLD = 0.95; // Smaller numbers mean wider rivers connecting the lakes

const generate: Generator = (x, y) => {
  const biome = simplex.noise2D(x * SCALE, y * SCALE);
  const temperature = simplex.noise2D(
    x * TEMPERATURE_SCALE,
    y * TEMPERATURE_SCALE
  );
  const absTemperature = Math.abs(temperature);

  const moisture = simplex.noise2D(x * MOISTURE_SCALE, y * MOISTURE_SCALE);
  const river = 1.0 - Math.abs(moisture);

  const height = simplex.noise2D(x * HEIGHT_SCALE, y * HEIGHT_SCALE);
  const absHeight = Math.abs(height);

  const biassedTemperature = (temperature + height / 3) * 0.83;
  const randomizedTemperature =
    biassedTemperature + ((absTemperature * 9241) % 1) / 3;

  // Rivers and lakes become smaller in hot biomes
  const rivers = river > RIVER_THRESHOLD + biassedTemperature / 10;
  const riverLakes =
    river + biome / 3 + height - 0.4 > RIVER_THRESHOLD + biassedTemperature / 2;

  if (rivers || riverLakes) {
    // Water in cold biomes freezes
    // Random part creates a gradient when transitioning biomes
    if (temperature + ((absTemperature * 1811) % 1) / 7 < -0.6) {
      return new Tile(x, y, TileType.Ice);
    }
    return new Tile(x, y, TileType.Water);
  } else if (river > RIVER_THRESHOLD + biassedTemperature / 15) {
    // Add dirt where a river would flow if it weren't so hot
    return new Tile(x, y, TileType.Dirt);
  }

  let tile: Tile;
  if (biassedTemperature > 0.3) {
    tile = new Tile(x, y, TileType.Sand);
  } else if (biassedTemperature < -0.5) {
    tile = new Tile(x, y, TileType.Snow);
  } else {
    tile = new Tile(x, y, TileType.Grass);
  }

  const fertility =
    (height + 0.5) * (biome - 0.5) + ((absTemperature * 5419) % 1) / 10;

  if (
    fertility < 0.07 &&
    fertility > 0.04 &&
    randomizedTemperature > -0.4 &&
    randomizedTemperature < 0.6
  ) {
    const tree = new Tree(tile);
    tile.setStaticEntity(tree.entity);
  } else if (
    (randomizedTemperature < -0.5 || randomizedTemperature > 0.7) &&
    (absHeight * 2791) % 1 > 0.99
  ) {
    const rock = new Rock(tile);
    tile.setStaticEntity(rock.entity);
  }

  return tile;
};

export default generate;
