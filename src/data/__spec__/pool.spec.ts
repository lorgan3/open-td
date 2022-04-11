import Pool, { PoolType } from "../pool";

describe("pool", () => {
  it("initializes a growing pool", () => {
    const initializer = jest.fn(() => "");
    const pool = new Pool<number, string>(initializer, PoolType.Growing, 2);

    expect(pool.getSize()).toEqual(2);

    expect(initializer).toHaveBeenCalledTimes(2);
    expect(pool.get(1)).toEqual("");
    expect(initializer).toHaveBeenLastCalledWith(true, "", 1);
    expect(pool.get(2)).toEqual("");
    expect(initializer).toHaveBeenLastCalledWith(true, "", 2);

    expect(initializer).toHaveBeenCalledTimes(4);
    expect(pool.get(3)).toEqual("");

    expect(initializer).toHaveBeenLastCalledWith(true, undefined, 3);
    expect(initializer).toHaveBeenCalledTimes(5);

    expect(pool.getSize()).toEqual(3);
  });

  it("initializes a fixed pool", () => {
    const initializer = jest.fn(() => "");
    const pool = new Pool<number, string>(initializer, PoolType.Fixed, 2);

    expect(pool.getSize()).toEqual(2);

    expect(initializer).toHaveBeenCalledTimes(2);
    expect(pool.get(1)).toEqual("");
    expect(initializer).toHaveBeenLastCalledWith(true, "", 1);
    expect(pool.get(2)).toEqual("");
    expect(initializer).toHaveBeenLastCalledWith(true, "", 2);

    expect(initializer).toHaveBeenCalledTimes(4);
    expect(() => pool.get(3)).toThrow();
    expect(initializer).toHaveBeenCalledTimes(4);

    expect(pool.getSize()).toEqual(2);

    pool.free(2);
    expect(pool.get(4)).toEqual("");
  });
});
