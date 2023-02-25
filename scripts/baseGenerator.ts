import Jimp from "jimp";
import { NamedImage, write } from "./util.js";

const SCALE = 64;
const BORDER_WIDTH = 4;

const atlas = await Jimp.read("./scripts/base.png");
const background = new Jimp(SCALE, SCALE).blit(atlas, 0, 0, 0, 0, SCALE, SCALE);

const borders = new Jimp(SCALE, SCALE).blit(
  atlas,
  0,
  0,
  0,
  SCALE,
  SCALE,
  SCALE
);

const images: NamedImage[] = [];

images.push({ image: background, name: "base-0000" });

// Left
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 1, 0, 1, 0, SCALE - 1, SCALE)
    .blit(borders, 0, 0, 0, 0, BORDER_WIDTH, SCALE),
  name: "base-0001",
});

// Left + top
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 1, 1, 1, 1, SCALE - 1, SCALE - 1)
    .blit(borders, 0, 0, 0, 0, BORDER_WIDTH, SCALE)
    .blit(borders, 0, 0, 0, 0, SCALE, BORDER_WIDTH),
  name: "base-1001",
});

// Left + top + right
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 1, 1, 1, 1, SCALE - 2, SCALE - 1)
    .blit(borders, 0, 0, 0, 0, BORDER_WIDTH, SCALE)
    .blit(borders, 0, 0, 0, 0, SCALE, BORDER_WIDTH)
    .blit(
      borders,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      0,
      BORDER_WIDTH,
      SCALE
    ),
  name: "base-1101",
});

// Top
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 0, 1, 0, 1, SCALE, SCALE - 1)
    .blit(borders, 0, 0, 0, 0, SCALE, BORDER_WIDTH),
  name: "base-1000",
});

// Top + right
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 0, 1, 0, 1, SCALE - 1, SCALE - 1)
    .blit(borders, 0, 0, 0, 0, SCALE, BORDER_WIDTH)
    .blit(
      borders,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      0,
      BORDER_WIDTH,
      SCALE
    ),
  name: "base-1100",
});

// Top + right + bottom
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 0, 1, 0, 1, SCALE - 1, SCALE - 2)
    .blit(borders, 0, 0, 0, 0, SCALE, BORDER_WIDTH)
    .blit(
      borders,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      0,
      BORDER_WIDTH,
      SCALE
    )
    .blit(
      borders,
      0,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      SCALE,
      BORDER_WIDTH
    ),
  name: "base-1110",
});

// Right
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 0, 0, 0, 0, SCALE - 1, SCALE)
    .blit(
      borders,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      0,
      BORDER_WIDTH,
      SCALE
    ),
  name: "base-0100",
});

// Right + bottom
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 0, 0, 0, 0, SCALE - 1, SCALE - 1)
    .blit(
      borders,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      0,
      BORDER_WIDTH,
      SCALE
    )
    .blit(
      borders,
      0,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      SCALE,
      BORDER_WIDTH
    ),
  name: "base-0110",
});

// Right + bottom + left
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 1, 0, 1, 0, SCALE - 2, SCALE - 1)
    .blit(
      borders,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      0,
      BORDER_WIDTH,
      SCALE
    )
    .blit(
      borders,
      0,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      SCALE,
      BORDER_WIDTH
    )
    .blit(borders, 0, 0, 0, 0, BORDER_WIDTH, SCALE),
  name: "base-0111",
});

// Bottom
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 0, 0, 0, 0, SCALE, SCALE - 1)
    .blit(
      borders,
      0,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      SCALE,
      BORDER_WIDTH
    ),
  name: "base-0010",
});

// Bottom + left
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 1, 0, 1, 0, SCALE - 1, SCALE - 1)
    .blit(
      borders,
      0,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      SCALE,
      BORDER_WIDTH
    )
    .blit(borders, 0, 0, 0, 0, BORDER_WIDTH, SCALE),
  name: "base-0011",
});

// Bottom + left + top
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 1, 1, 1, 1, SCALE - 1, SCALE - 2)
    .blit(
      borders,
      0,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      SCALE,
      BORDER_WIDTH
    )
    .blit(borders, 0, 0, 0, 0, BORDER_WIDTH, SCALE)
    .blit(borders, 0, 0, 0, 0, SCALE, BORDER_WIDTH),
  name: "base-1011",
});

// Bottom + left + top + right
images.push({
  image: new Jimp(SCALE, SCALE)
    .blit(background, 1, 1, 1, 1, SCALE - 2, SCALE - 2)
    .blit(
      borders,
      0,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      SCALE,
      BORDER_WIDTH
    )
    .blit(borders, 0, 0, 0, 0, BORDER_WIDTH, SCALE)
    .blit(borders, 0, 0, 0, 0, SCALE, BORDER_WIDTH)
    .blit(
      borders,
      SCALE - BORDER_WIDTH,
      0,
      SCALE - BORDER_WIDTH,
      0,
      BORDER_WIDTH,
      SCALE
    ),
  name: "base-1111",
});

await write(images, "baseAtlas");
