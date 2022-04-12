import Tile from "../../terrain/tile";
import Base from "../base";

describe("entity", () => {
  describe("move", () => {
    const from = new Tile(0, 0);
    const to = new Tile(1, 1);

    it("is at the start tile when t is 0", () => {
      const agent = new Base(from);
      agent.entity.move(from, to, 0);
      expect(agent.entity.getX()).toEqual(from.getX());
      expect(agent.entity.getY()).toEqual(from.getY());
      expect(agent.entity.getRotation()).toEqual(135);
    });

    it("is at the end tile when t is 1", () => {
      const agent = new Base(from);
      agent.entity.move(from, to, 1);
      expect(agent.entity.getX()).toEqual(to.getX());
      expect(agent.entity.getY()).toEqual(to.getY());
      expect(agent.entity.getRotation()).toEqual(0);
    });

    it("is between 2 tiles when t is 0.3", () => {
      const agent = new Base(from);
      agent.entity.move(from, to, 0.3);
      expect(agent.entity.getX()).toEqual(0.3);
      expect(agent.entity.getY()).toEqual(0.3);
      expect(agent.entity.getRotation()).toEqual(135);
    });
  });

  describe("lookAt", () => {
    const agent = new Base(new Tile(5, 5));
    const table = [
      {
        target: new Tile(4, 5),
        expected: 270,
      },
      {
        target: new Tile(4, 4),
        expected: -45,
      },
      {
        target: new Tile(5, 4),
        expected: 0,
      },
      {
        target: new Tile(6, 4),
        expected: 45,
      },
      {
        target: new Tile(6, 5),
        expected: 90,
      },
      {
        target: new Tile(6, 6),
        expected: 135,
      },
      {
        target: new Tile(5, 6),
        expected: 180,
      },
      {
        target: new Tile(4, 6),
        expected: 225,
      },
      {
        target: new Tile(8, 9),
        expected: 143.13010235415598,
      },
    ];

    it.each(table)("Looks at the target $#", ({ target, expected }) => {
      agent.entity.lookAt(target);
      expect(agent.entity.getRotation()).toEqual(expected);
    });
  });
});
