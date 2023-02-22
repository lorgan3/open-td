import Tile from "./tile";
import { createNoise2D } from "simplex-noise";
import Tree from "../entity/tree";
import Rock from "../entity/rock";
import Alea from "alea";
import { AltTileType, TileType } from "./constants";

export type Generator = (x: number, y: number) => Tile;

export interface Edges {
  top: number[];
  right: number[];
  bottom: number[];
  left: number[];
}

const getGenerator = (seed: string, mapWidth: number, mapHeight: number) => {
  const prng = Alea(seed);
  const noise2D = createNoise2D(prng);

  const xOffset = noise2D(1, 0) * 193;
  const yOffset = noise2D(0, 1) * 197;

  const SCALE = 0.048;
  const MOISTURE_SCALE = 0.0077;
  const TEMPERATURE_SCALE = 0.0025;
  const HEIGHT_SCALE = 0.0194;
  const EDGE_SCALE = 0.039;
  const EDGE_DEPTH = 13;
  const DOUBLE_EDGE_DEPTH = EDGE_DEPTH * 2;
  const EDGE_CORNER_MULTIPLIER = 0.1;

  const RIVER_THRESHOLD = 0.95; // Smaller numbers mean wider rivers connecting the lakes

  const edges: Edges = {
    top: [],
    right: [],
    bottom: [],
    left: [],
  };

  for (let i = 0; i < mapWidth; i++) {
    let multiplier = 0;
    if (i < DOUBLE_EDGE_DEPTH) {
      multiplier = (DOUBLE_EDGE_DEPTH - i) * EDGE_CORNER_MULTIPLIER;
    } else if (i > mapWidth - DOUBLE_EDGE_DEPTH) {
      multiplier = (DOUBLE_EDGE_DEPTH - mapWidth + i) * EDGE_CORNER_MULTIPLIER;
    }

    edges.top[i] = (noise2D(i * EDGE_SCALE, 0) + 1 + multiplier) * EDGE_DEPTH;
    edges.bottom[i] =
      (noise2D(i * EDGE_SCALE, mapHeight * EDGE_SCALE) + 1 + multiplier) *
      EDGE_DEPTH;
  }

  for (let i = 0; i < mapHeight; i++) {
    let multiplier = 0;
    if (i < DOUBLE_EDGE_DEPTH) {
      multiplier = (DOUBLE_EDGE_DEPTH - i) * EDGE_CORNER_MULTIPLIER;
    } else if (i > mapHeight - DOUBLE_EDGE_DEPTH) {
      multiplier = (DOUBLE_EDGE_DEPTH - mapHeight + i) * EDGE_CORNER_MULTIPLIER;
    }

    edges.right[i] =
      (noise2D(mapWidth * EDGE_SCALE, i * EDGE_SCALE) + 1 + multiplier) *
      EDGE_DEPTH;
    edges.left[i] = (noise2D(0, i * EDGE_SCALE) + 1 + multiplier) * EDGE_DEPTH;
  }

  const generate: Generator = (x, y) => {
    if (
      y < edges.top[x] ||
      y > mapHeight - edges.bottom[x] ||
      x < edges.left[y] ||
      x > mapWidth - edges.right[y]
    ) {
      return new Tile(x, y, TileType.Void);
    }

    const x1 = x + xOffset;
    const y1 = y + yOffset;

    const biome = noise2D(x1 * SCALE, y1 * SCALE);
    const temperature = noise2D(x1 * TEMPERATURE_SCALE, y1 * TEMPERATURE_SCALE);
    const absTemperature = Math.abs(temperature);

    const moisture = noise2D(x1 * MOISTURE_SCALE, y1 * MOISTURE_SCALE);
    const river = 1.0 - Math.abs(moisture);

    const height = noise2D(x1 * HEIGHT_SCALE, y1 * HEIGHT_SCALE);
    const absHeight = Math.abs(height);

    const biassedTemperature = (temperature + height / 3) * 0.83;
    const randomizedTemperature =
      biassedTemperature + ((absTemperature * 9241) % 1) / 3;

    // Rivers and lakes become smaller in hot biomes
    const rivers = river > RIVER_THRESHOLD + biassedTemperature / 10;
    const riverLakes =
      river + biome / 3 + height - 0.4 >
      RIVER_THRESHOLD + biassedTemperature / 2;

    if (rivers || riverLakes) {
      // Water in cold biomes freezes
      // Random part creates a gradient when transitioning biomes
      if (temperature + ((absTemperature * 1811) % 1) / 7 < -0.6) {
        return new Tile(
          x,
          y,
          (absTemperature * 1439) % 1 > 0.5 ? TileType.Ice : AltTileType.IceAlt
        );
      }
      return new Tile(x, y, TileType.Water);
    } else if (river > RIVER_THRESHOLD + biassedTemperature / 15) {
      // Add dirt where a river would flow if it weren't so hot
      return new Tile(x, y, TileType.Dirt);
    }

    let tile: Tile;
    if (biassedTemperature > 0.3) {
      tile = new Tile(
        x,
        y,
        (biassedTemperature * 1439) % 1 > 0.3
          ? TileType.Sand
          : AltTileType.SandAlt
      );
    } else if (biassedTemperature < -0.5) {
      tile = new Tile(
        x,
        y,
        (biassedTemperature * -1439) % 1 > 0.3
          ? TileType.Snow
          : AltTileType.SnowAlt
      );
    } else {
      const rng = (Math.abs(biassedTemperature) * 4999) % 1;

      tile = new Tile(
        x,
        y,
        rng < 0.05
          ? AltTileType.GrassFlower
          : rng < 0.1
          ? AltTileType.GrassAlt
          : rng < 0.6
          ? AltTileType.GrassPlain
          : TileType.Grass
      );
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

  return generate;
};
export default getGenerator;
