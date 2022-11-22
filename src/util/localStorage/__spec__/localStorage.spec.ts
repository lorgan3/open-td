import { get, set } from "..";
import renderer from "../../../renderers/pixiRenderer/renderer";

jest.mock("../../../renderers/pixiRenderer/renderer", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../../../renderers/emojiRenderer/renderer", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("localStorage", () => {
  jest.spyOn(window.localStorage.__proto__, "setItem");
  const getItem = jest.spyOn(window.localStorage.__proto__, "getItem");

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("Gets values", () => {
    getItem.mockReturnValue(
      JSON.stringify({ renderer: "pixiRenderer", difficulty: "easy" })
    );

    expect(get("settings")).toEqual({
      renderer,
      difficulty: "easy",
    });
  });

  it("Gets values when localStorage is not available", () => {
    getItem.mockImplementation(() => {
      throw new Error("Not today");
    });

    expect(get("settings")).toBeNull();
  });

  it("Gets values when localStorage is empty", () => {
    getItem.mockReturnValue(null);

    expect(get("settings")).toBeNull();
  });

  it("Does not get invalid values", () => {
    getItem.mockReturnValue(
      JSON.stringify({ difficulty: "this_does_not_exist" })
    );

    expect(get("settings")).toEqual({});
  });

  it("Sets values", () => {
    getItem.mockReturnValue(JSON.stringify({}));

    set("settings", { renderer });

    const expected = { renderer: "pixiRenderer" };
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "settings",
      JSON.stringify(expected)
    );
  });

  it("Updates values", () => {
    getItem.mockReturnValue(
      JSON.stringify({ renderer: "emojiRenderer", difficulty: "easy" })
    );

    set("settings", { renderer });

    const expected = { renderer: "pixiRenderer", difficulty: "easy" };
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "settings",
      JSON.stringify(expected)
    );
  });
});
