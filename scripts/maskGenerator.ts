import Alea from "alea";
import Jimp from "jimp";
import { createNoise2D } from "simplex-noise";

// Seeded random generator.
const prng = Alea("🗺️");
const noise2D = createNoise2D(prng);

// Tile size.
const SCALE = 32;

// Amount of tiles, the mask is repeated so does not need to match the world size.
const TILES = 6;

// Noise scale decides the consistency of the blending. Smaller numbers mean more consistent blending with larger 'blobs'.
// Simplex noise does not tile so large blobs look weird unfortunately.
const NOISE_SCALE = 0.128;

// Threshold decides the depth of the blending. Small numbers mean the blending goes deeper.
const THRESHOLD = 1.6;

// Bias decides the importance of the tile edges. Higher bias starts looking very 'square'.
// When changing the bias the threshold will also need to be adjusted.
const BIAS = 3;

const WIDTH = SCALE * TILES;

const createMask = () => {
  const mask = new Jimp(WIDTH, WIDTH);

  for (let j = 0; j < WIDTH; j++) {
    for (let i = 0; i < WIDTH; i++) {
      const noise = noise2D(i * NOISE_SCALE, j * NOISE_SCALE);
      const x = (i % SCALE) / SCALE - 0.5;
      const y = (j % SCALE) / SCALE - 0.5;

      const xResult = noise + x * BIAS;
      const yResult = noise + y * BIAS;

      // Multiplier tones down the randomness in corners a bit.
      const multiplier = Math.abs(x * y) / 2 + 1;
      const threshold = multiplier * THRESHOLD;

      // Start with [0.5, 0.5, 0.5, 1.0] (rgba)
      let color = 0x808080ff;

      // Set red to 1 if it matches on the left and 0 if it matches on the right.
      if (xResult > threshold && noise > 0) {
        color = (color | 0xff000000) >>> 0;
      } else if (xResult < -threshold && noise < 0) {
        color = (color & 0x00ffffff) >>> 0;
      }

      // Set blue to 1 if it matches on the left and 0 if it matches on the right.
      if (yResult > threshold && noise > 0) {
        color = (color | 0x00ff0000) >>> 0;
      } else if (yResult < -threshold && noise < 0) {
        color = (color & 0xff00ffff) >>> 0;
      }

      // Green is not used.

      mask.setPixelColor(color, i, j);
    }
  }

  return mask;
};

await createMask().write("./scripts/mask.png");
