import { normalDistributionRandom, splitNumber } from "../util";

describe("Wave utils", () => {
  it("returns the original number if there is only 1 part", () => {
    expect(splitNumber(10, 1)).toEqual([10]);
  });

  it("splits a number in equal parts if all weights are the same", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);

    expect(splitNumber(10, 4)).toEqual([2.5, 2.5, 2.5, 2.5]);
  });

  it("splits a number according to the weights", () => {
    let count = 0;
    jest.spyOn(Math, "random").mockImplementation(() => ++count / 5);

    expect(splitNumber(10, 4)).toEqual([1, 2, 3, 4]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
