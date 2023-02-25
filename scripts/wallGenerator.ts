import Jimp from "jimp";
import { NamedImage, rotate, write } from "./util.js";

const TILE_SIZE = 32;
const MULTIPLIER = 1.25; // We need a bigger frame to make diagonal connections
const OFFSET_MULTIPLIER = (MULTIPLIER - 1) / 2;

/**
 * We store every sprite based on the connections going clockwise.
 * This function can 'rotate' the resulting string by amount * 90 degrees.
 */
const rotateString = (s: string, amount: number) => {
  const end = s.slice(-amount * 2);
  return end + s.slice(0, -amount * 2);
};

/**
 * Generate ~50 sprites based on the atlas for every possible wall orientation.
 * Not all orientations are supported: when a cardinal wall is followed by a diagonal wall, the diagonal wall is ignored.
 */
const generateSprites = (atlas: Jimp, scale: number, name: string) => {
  const sourceSize = TILE_SIZE * scale;
  const actualSize = sourceSize * MULTIPLIER;
  const offset = sourceSize * OFFSET_MULTIPLIER;

  const bigCenter = new Jimp(sourceSize, sourceSize).blit(
    atlas,
    0,
    0,
    0,
    0,
    sourceSize,
    sourceSize
  );
  const smallCenter = new Jimp(sourceSize, sourceSize).blit(
    atlas,
    0,
    0,
    sourceSize,
    0,
    sourceSize,
    sourceSize
  );
  const wall = new Jimp(sourceSize, sourceSize).blit(
    atlas,
    0,
    0,
    0,
    sourceSize,
    sourceSize,
    sourceSize
  );
  const diagonalWall = rotate(
    new Jimp(actualSize, actualSize).blit(wall, offset, offset),
    -45
  );
  diagonalWall.blit(diagonalWall, sourceSize * 0.275, -sourceSize * 0.275);

  const images: NamedImage[] = [];

  images.push({
    image: new Jimp(actualSize, actualSize).blit(bigCenter, offset, offset),
    name: `${name}-00000000`,
  });

  for (let i = 0; i < 4; i++) {
    images.push({
      image: rotate(
        new Jimp(actualSize, actualSize).blit(wall, offset, offset),
        -90 * i
      ).blit(bigCenter, offset, offset),
      name: `${name}-${rotateString("10000000", i)}`,
    });

    images.push({
      image: rotate(
        new Jimp(actualSize, actualSize).blit(diagonalWall, 0, 0),
        -90 * i
      ).blit(bigCenter, offset, offset),
      name: `${name}-${rotateString("01000000", i)}`,
    });

    images.push({
      image: rotate(
        rotate(
          rotate(
            new Jimp(actualSize, actualSize).blit(wall, offset, offset),
            -90
          ).blit(wall, offset, offset),
          -90
        ),
        -90 * i
      ).blit(smallCenter, offset, offset),
      name: `${name}-${rotateString("00101000", i)}`,
    });

    images.push({
      image: rotate(
        rotate(
          new Jimp(actualSize, actualSize).blit(diagonalWall, 0, 0),
          -90
        ).blit(diagonalWall, 0, 0),
        -90 * i
      ).blit(smallCenter, offset, offset),
      name: `${name}-${rotateString("01010000", i)}`,
    });

    images.push({
      image: rotate(
        rotate(
          new Jimp(actualSize, actualSize).blit(diagonalWall, 0, 0),
          -90
        ).blit(wall, offset, offset),
        -90 * i
      ).blit(smallCenter, offset, offset),
      name: `${name}-${rotateString("10010000", i)}`,
    });

    images.push({
      image: rotate(
        rotate(
          new Jimp(actualSize, actualSize).blit(diagonalWall, 0, 0),
          180
        ).blit(wall, offset, offset),
        -90 * i
      ).blit(smallCenter, offset, offset),
      name: `${name}-${rotateString("10000100", i)}`,
    });

    images.push({
      image: rotate(
        rotate(
          rotate(
            new Jimp(actualSize, actualSize).blit(wall, offset, offset),
            -90
          ).blit(wall, offset, offset),
          -90
        ).blit(wall, offset, offset),
        -90 * i
      ).blit(smallCenter, offset, offset),
      name: `${name}-${rotateString("10101000", i)}`,
    });

    images.push({
      image: rotate(
        rotate(
          rotate(
            new Jimp(actualSize, actualSize).blit(diagonalWall, 0, 0),
            -90
          ).blit(diagonalWall, 0, 0),
          -90
        ).blit(diagonalWall, 0, 0),
        -90 * i
      ).blit(smallCenter, offset, offset),
      name: `${name}-${rotateString("01010100", i)}`,
    });

    images.push({
      image: rotate(
        rotate(
          rotate(
            new Jimp(actualSize, actualSize).blit(diagonalWall, 0, 0),
            -90
          ).blit(wall, offset, offset),
          -90
        ).blit(wall, offset, offset),
        -90 * i
      ).blit(smallCenter, offset, offset),
      name: `${name}-${rotateString("10100100", i)}`,
    });

    images.push({
      image: rotate(
        rotate(
          rotate(
            new Jimp(actualSize, actualSize).blit(diagonalWall, 0, 0),
            -90
          ).blit(diagonalWall, 0, 0),
          -90
        ).blit(wall, offset, offset),
        -90 * i
      ).blit(smallCenter, offset, offset),
      name: `${name}-${rotateString("10010100", i)}`,
    });
  }

  for (let i = 0; i < 2; i++) {
    images.push({
      image: rotate(
        rotate(
          new Jimp(actualSize, actualSize).blit(wall, offset, offset),
          180
        ).blit(wall, offset, offset),
        -90 * i
      ).blit(smallCenter, offset, offset),
      name: `${name}-${rotateString("10001000", i)}`,
    });

    images.push({
      image: rotate(
        rotate(
          new Jimp(actualSize, actualSize).blit(diagonalWall, 0, 0),
          180
        ).blit(diagonalWall, 0, 0),
        -90 * i
      ).blit(smallCenter, offset, offset),
      name: `${name}-${rotateString("01000100", i)}`,
    });
  }

  images.push({
    image: rotate(
      rotate(
        rotate(
          new Jimp(actualSize, actualSize).blit(wall, offset, offset),
          -90
        ).blit(wall, offset, offset),
        -90
      ).blit(wall, offset, offset),
      -90
    )
      .blit(wall, offset, offset)
      .blit(smallCenter, offset, offset),
    name: `${name}-10101010`,
  });

  images.push({
    image: rotate(
      rotate(
        rotate(
          new Jimp(actualSize, actualSize).blit(diagonalWall, 0, 0),
          -90
        ).blit(diagonalWall, 0, 0),
        -90
      ).blit(diagonalWall, 0, 0),
      -90
    )
      .blit(diagonalWall, 0, 0)
      .blit(smallCenter, offset, offset),
    name: `${name}-01010101`,
  });

  return images.sort(
    (a, b) =>
      a.name.split("1").length - b.name.split("1").length ||
      b.name.localeCompare(a.name)
  );
};

const fence = await Jimp.read("./scripts/fenceAtlas.png");
await write(generateSprites(fence, 1, "fence"), "fence");

const wall = await Jimp.read("./scripts/wallAtlas.png");
await write(generateSprites(wall, 2, "wall"), "wall");
