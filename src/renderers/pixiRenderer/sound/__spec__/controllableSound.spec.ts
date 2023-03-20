import Rock from "../../../../data/entity/rock";
import Tile from "../../../../data/terrain/tile";
import { DEFAULT_SCALE, SCALE } from "../../constants";
import { ControllableSound } from "../controllableSound";
import { vi, describe, beforeAll, afterAll, it, expect } from "vitest";

let getViewport = vi.fn();
describe("ControllableSound", () => {
  beforeAll(() => {
    vi.mock("../../renderer", () => ({
      default: {
        Instance: {
          getViewport: () => getViewport(),
        },
      },
    }));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("pans a sound when played left in the viewport", () => {
    const agent = new Rock(new Tile(5, 5));
    getViewport.mockReturnValue({
      x: 10 * SCALE,
      y: 5 * SCALE,
      width: 10 * SCALE,
      height: 10 * SCALE,
      scale: DEFAULT_SCALE,
    });

    expect(ControllableSound.getSoundOptions(agent.entity)).toEqual({
      volume: 1,
      pan: -0.5,
    });
  });

  it("pans and lowers a sound when played left outside the viewport", () => {
    const agent = new Rock(new Tile(2, 5));
    getViewport.mockReturnValue({
      x: 10 * SCALE,
      y: 5 * SCALE,
      width: 10 * SCALE,
      height: 10 * SCALE,
      scale: DEFAULT_SCALE,
    });

    expect(ControllableSound.getSoundOptions(agent.entity)).toEqual({
      volume: 0.3571428571428571,
      pan: -1,
    });
  });

  it("pans and lowers a sound when played top left outside the viewport", () => {
    const agent = new Rock(new Tile(2, 2));
    getViewport.mockReturnValue({
      x: 10 * SCALE,
      y: 10 * SCALE,
      width: 10 * SCALE,
      height: 10 * SCALE,
      scale: DEFAULT_SCALE,
    });

    expect(ControllableSound.getSoundOptions(agent.entity)).toEqual({
      volume: 0.21739130434782605,
      pan: -1,
    });
  });

  it("plays a sound at full volume in middle of the viewport", () => {
    const agent = new Rock(new Tile(5, 5));
    getViewport.mockReturnValue({
      x: 5 * SCALE,
      y: 5 * SCALE,
      width: 10 * SCALE,
      height: 10 * SCALE,
      scale: DEFAULT_SCALE,
    });

    expect(ControllableSound.getSoundOptions(agent.entity)).toEqual({
      volume: 1,
      pan: 0,
    });
  });
});
