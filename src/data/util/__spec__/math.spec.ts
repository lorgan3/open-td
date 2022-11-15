import { clamp, clampDegrees, lerp } from "../math";

describe("lerp", () => {
  it("returns start position at 0", () => {
    expect(lerp(10, 20, 0)).toEqual(10);
  });

  it("returns end position at 1", () => {
    expect(lerp(10, 20, 1)).toEqual(20);
  });

  it("returns middle position at 0.5", () => {
    expect(lerp(10, 20, 0.5)).toEqual(15);
  });
});

describe("clamp", () => {
  it("clamps when current = desired", () => {
    expect(clamp(10, 10, 3)).toEqual(10);
  });

  it("clamps when current > desired", () => {
    expect(clamp(15, 10, 3)).toEqual(12);
  });

  it("clamps when current < desired", () => {
    expect(clamp(5, 10, 3)).toEqual(8);
  });

  it("clamps when desired - current  < speed", () => {
    expect(clamp(9, 10, 3)).toEqual(10);
  });
});

describe("clampDegrees", () => {
  it("clamps when current = desired", () => {
    expect(clampDegrees(90, 90, 45)).toEqual(90);
  });

  it("clamps when current > desired near 0", () => {
    expect(clampDegrees(90, 0, 45)).toEqual(45);
  });

  it("clamps when current > desired near 360", () => {
    expect(clampDegrees(270, 0, 45)).toEqual(315);
  });

  it("clamps when current > desired near 180", () => {
    expect(clampDegrees(180, 270, 45)).toEqual(225);
  });

  it("clamps when current > desired near 180 2", () => {
    expect(clampDegrees(90, 180, 45)).toEqual(135);
  });

  it("clamps when current < desired near 0", () => {
    expect(clampDegrees(0, 90, 45)).toEqual(45);
  });

  it("clamps when current < desired near 360", () => {
    expect(clampDegrees(0, 270, 45)).toEqual(315);
  });

  it("clamps when desired - current  < speed", () => {
    expect(clampDegrees(80, 90, 45)).toEqual(90);
  });
});
