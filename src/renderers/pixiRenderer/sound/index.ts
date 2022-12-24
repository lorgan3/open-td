import { sound } from "@pixi/sound";

export enum Sound {
}

const preload = (alias: Sound, path: string, volume = 1) => {
  sound.add(alias, {
    url: `${import.meta.env.BASE_URL}${path}`,
    preload: true,
    volume,
  });
};

export const init = () => {
};
