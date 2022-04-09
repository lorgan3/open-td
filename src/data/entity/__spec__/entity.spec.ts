import Tile from "../../terrain/tile";
import Enemy from "../enemy";

describe("entity", () => {
  describe("move", () => {
    const from = new Tile(0, 0);
    const to = new Tile(1, 1);

    it("is at the start tile when t is 0", () => {
      const agent = new Enemy(from);
      agent.entity.move(from, to, 0);
      expect(agent.entity.getX()).toEqual(from.getX());
      expect(agent.entity.getY()).toEqual(from.getY());
      expect(agent.entity.getRotation()).toEqual(135);
    });

    it("is at the end tile when t is 1", () => {
      const agent = new Enemy(from);
      agent.entity.move(from, to, 1);
      expect(agent.entity.getX()).toEqual(to.getX());
      expect(agent.entity.getY()).toEqual(to.getY());
      expect(agent.entity.getRotation()).toEqual(0);
    });

    it("is between 2 tiles when t is 0.3", () => {
      const agent = new Enemy(from);
      agent.entity.move(from, to, 0.3);
      expect(agent.entity.getX()).toEqual(0.3);
      expect(agent.entity.getY()).toEqual(0.3);
      expect(agent.entity.getRotation()).toEqual(135);
    });
  });
});
