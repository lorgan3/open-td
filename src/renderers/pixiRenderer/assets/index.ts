import { Assets } from "@pixi/assets";
import { spriteOverrideAssets } from "../overrides";
import { spriteAssets } from "../tilemap/constants";

Assets.addBundle("assets", {
  // ...soundAssets,
  ...spriteAssets,
  ...spriteOverrideAssets,
});

let promise: Promise<any> | undefined;

export const getAssets = () => {
  if (promise) {
    return promise;
  }

  promise = Assets.loadBundle("assets");
  return promise;
};
