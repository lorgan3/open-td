import Jimp from "jimp";
import { Block, GrowingPacker, Resolution } from "binpacking";
import fs from "fs";
import { Atlas, Frame } from "./util";

interface SpriteBlock extends Block {
  jimp: Jimp;
  name: string;
  fit?: Resolution;
}

const blocks: SpriteBlock[] = [];

const DIRECTORY = "./public/atlas/";

// This might help with edges containing colors of adjacent sprites in the atlas?
// @todo this doesn't really work for margins > 1
const MARGIN = 1;

const files = fs
  .readdirSync(DIRECTORY)
  .filter((file) => file.endsWith(".json"));

for (let file of files) {
  let atlas: Atlas;

  try {
    atlas = JSON.parse(fs.readFileSync(DIRECTORY + file).toString());
  } catch (error) {
    console.error(`Failed to load atlas for ${file}`, error);
    process.exit(1);
  }

  let image: Jimp;

  try {
    image = await Jimp.read(DIRECTORY + atlas.meta.image);
  } catch (error) {
    console.error(`Failed to load image for atlas ${file}`, error);
    process.exit(1);
  }

  Object.entries(atlas.frames).forEach(([name, { frame }]) => {
    const jimp = new Jimp(frame.w, frame.h).blit(
      image,
      0,
      0,
      frame.x,
      frame.y,
      frame.w,
      frame.h
    );

    blocks.push({
      name,
      w: frame.w + MARGIN * 2,
      h: frame.h + MARGIN * 2,
      jimp,
    });
  });
}

blocks.sort((a, b) => b.h - a.h);

const packer = new GrowingPacker();
packer.fit(blocks);

const frames: Record<string, Frame> = {};
const atlas = new Jimp(packer.root.w, packer.root.h);
for (let block of blocks) {
  if (block.fit!.used) {
    atlas
      .blit(block.jimp, block.fit!.x + MARGIN, block.fit!.y + MARGIN)
      .blit(
        block.jimp,
        block.fit!.x + MARGIN,
        block.fit!.y,
        0,
        0,
        block.w - MARGIN * 2,
        MARGIN
      )
      .blit(
        block.jimp,
        block.fit!.x + MARGIN,
        block.fit!.y + block.h - MARGIN,
        0,
        block.h - MARGIN * 3,
        block.w - MARGIN * 2,
        MARGIN
      )
      .blit(
        block.jimp,
        block.fit!.x,
        block.fit!.y + MARGIN,
        0,
        0,
        MARGIN,
        block.h - MARGIN * 2
      )
      .blit(
        block.jimp,
        block.fit!.x + block.w - MARGIN,
        block.fit!.y + MARGIN,
        block.w - MARGIN * 3,
        0,
        MARGIN,
        block.h - MARGIN * 2
      );

    frames[block.name] = {
      frame: {
        x: block.fit!.x + MARGIN,
        y: block.fit!.y + MARGIN,
        w: block.w - MARGIN * 2,
        h: block.h - MARGIN * 2,
      },
    };
  } else {
    console.error(`Block ${block.name} did not fit!`);
    process.exit(1);
  }
}

const json: Atlas = {
  frames,
  meta: {
    app: "https://github.com/lorgan3/open-td",
    version: "1.0",
    image: `atlas.png`,
    size: { w: packer.root.w, h: packer.root.h },
  },
};

await atlas.write(`./public/atlas.png`);
fs.writeFileSync(`./public/atlas.json`, JSON.stringify(json, undefined, 2));
