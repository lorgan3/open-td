import Tile, { TileType } from "../../terrain/tile";
import { getFuturePosition, getPathSection } from "../util";

describe("util", () => {
  describe("getPathSection", () => {
    const path = [
      new Tile(0, 0),
      new Tile(1, 0),
      new Tile(2, 0),
      new Tile(3, 1),
    ];

    const table = [
      {
        index: 0,
        speed: 0,
        expected: { from: path[0], to: path[1], step: 0 },
      },
      {
        index: 0.1,
        speed: 0,
        expected: { from: path[0], to: path[1], step: 0.1 },
      },
      {
        index: 2.5,
        speed: 0,
        expected: { from: path[2], to: path[3], step: 0.5 },
      },
      {
        index: 2.5,
        speed: 5,
        expected: { from: path[2], to: path[3], step: 0.5 },
      },
      {
        index: 0.5,
        speed: 5,
        expected: { from: path[0], to: path[3], step: 0.5 },
      },
    ];

    it.each(table)(
      "gets a section of a path at $index with speed $speed",
      ({ index, speed, expected }) => {
        const section = getPathSection(path, index, speed);
        expect(section).toEqual(expected);
      }
    );
  });

  describe("getFuturePosition", () => {
    const path = [
      new Tile(0, 0),
      new Tile(1, 0, TileType.Grass),
      new Tile(2, 0, TileType.Grass),
      new Tile(3, 1),
    ];

    const table = [
      {
        index: 0,
        time: 750,
        speed: 0.001,
        speedMultipliers: {},
        expected: 0.75,
      },
      {
        index: 0.5,
        time: 750,
        speed: 0.001,
        speedMultipliers: {},
        expected: 1.25,
      },
      {
        index: 2,
        time: 2000,
        speed: 0.001,
        speedMultipliers: {},
        expected: 3,
      },
      {
        index: 0,
        time: 2000,
        speed: 0.001,
        speedMultipliers: { [TileType.Grass]: 2 },
        expected: 1.5,
      },
      {
        index: 0.5,
        time: 750,
        speed: 0.001,
        speedMultipliers: { [TileType.Grass]: 2 },
        expected: 1.125,
      },
    ];

    it.each(table)(
      "gets the future position after $time ms with starting position $index and speed $speed",
      ({ index, time, speed, speedMultipliers, expected }) => {
        expect(
          getFuturePosition(path, index, time, speed, speedMultipliers)
        ).toEqual(expected);
      }
    );
  });
});
