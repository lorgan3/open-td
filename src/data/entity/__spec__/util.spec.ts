import Tile from "../../terrain/tile";
import { getPathSection } from "../util";

describe("util", () => {
  describe("getPathSection", () => {
    const path = [
      new Tile(0, 0),
      new Tile(1, 0),
      new Tile(2, 0),
      new Tile(3, 1),
    ];

    const getPathSectionTable = [
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

    it.each(getPathSectionTable)(
      "gets a section of a path at $index with speed $speed",
      ({ index, speed, expected }) => {
        const section = getPathSection(path, index, speed);
        expect(section).toEqual(expected);
      }
    );
  });
});
