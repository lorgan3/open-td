import { get, has, remove, set } from "..";
import renderer from "../../../renderers/pixiRenderer/renderer";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../../renderers/pixiRenderer/renderer", () => ({
  default: vi.fn(),
}));
vi.mock("../../../renderers/emojiRenderer/renderer", () => ({
  default: vi.fn(),
}));

describe("localStorage", () => {
  vi.spyOn(window.localStorage.__proto__, "setItem");
  const getItem = vi.spyOn(window.localStorage.__proto__, "getItem");
  const removeItem = vi.spyOn(window.localStorage.__proto__, "removeItem");

  beforeEach(() => {
    vi.resetAllMocks();
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

  it("Sets hashed values", () => {
    getItem.mockReturnValue(JSON.stringify({}));

    set("settings", { renderer }, true);

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "settings",
      "eyJyZW5kZXJlciI6InBpeGlSZW5kZXJlciJ9"
    );
  });

  it("Gets hashed values", () => {
    getItem.mockReturnValue("eyJyZW5kZXJlciI6InBpeGlSZW5kZXJlciJ9");

    expect(get("settings")).toEqual({
      renderer,
    });
  });

  it("Checks if values are present", () => {
    getItem.mockReturnValue(JSON.stringify({ difficulty: "easy" }));

    expect(has("settings")).toBeTruthy();
  });

  it("Checks if values are not present", () => {
    getItem.mockReturnValue("");

    expect(has("settings")).toBeFalsy();
  });

  it("removes values", () => {
    remove("settings");

    expect(removeItem).toHaveBeenCalledWith("settings");
  });
});
