import { PlayOptions, sound } from "@pixi/sound";
import { GameEvent } from "../../../data/events";
import EventSystem from "../../../data/eventSystem";

export enum Sound {
  Notification = "notification",
  Shot = "shot",
  Laser = "laser",
  Flamethrower = "flamethrower",
  Mortar = "mortar",
  Railgun = "railgun",
  Explosion = "explosion",
  Firework = "firework",
  Place = "place",
  Destroy = "destroy",
  Hit = "hit",
  Sonar = "sonar",
  Thunder = "thunder",
}

export const soundAssets = {
  [Sound.Notification]: `${import.meta.env.BASE_URL}sounds/notification.ogg`,
  [Sound.Shot]: `${import.meta.env.BASE_URL}sounds/shot.wav`,
  [Sound.Laser]: `${import.meta.env.BASE_URL}sounds/laser.flac`,
  [Sound.Flamethrower]: `${import.meta.env.BASE_URL}sounds/flamethrower.wav`,
  [Sound.Mortar]: `${import.meta.env.BASE_URL}sounds/mortar.wav`,
  [Sound.Railgun]: `${import.meta.env.BASE_URL}sounds/railgun.mp3`,
  [Sound.Explosion]: `${import.meta.env.BASE_URL}sounds/explosion.wav`,
  [Sound.Firework]: `${import.meta.env.BASE_URL}sounds/firework.wav`,
  [Sound.Place]: `${import.meta.env.BASE_URL}sounds/place.wav`,
  [Sound.Destroy]: `${import.meta.env.BASE_URL}sounds/destroy.wav`,
  [Sound.Hit]: `${import.meta.env.BASE_URL}sounds/hit.wav`,
  [Sound.Sonar]: `${import.meta.env.BASE_URL}sounds/sonar.wav`,
  [Sound.Thunder]: `${import.meta.env.BASE_URL}sounds/thunder.wav`,
};

const preload = (alias: Sound, path: string, volume = 1) => {
  sound.add(alias, {
    url: `${import.meta.env.BASE_URL}${path}`,
    preload: true,
    volume,
  });
};

export const init = () => {
  preload(Sound.Notification, "sounds/notification.ogg");
  preload(Sound.Shot, "sounds/shot.wav", 0.7);
  preload(Sound.Laser, "sounds/laser.flac", 0.5);
  preload(Sound.Flamethrower, "sounds/flamethrower.wav", 0.1);
  preload(Sound.Mortar, "sounds/mortar.wav", 0.7);
  preload(Sound.Railgun, "sounds/railgun.mp3", 0.7);
  preload(Sound.Explosion, "sounds/explosion.wav");
  preload(Sound.Firework, "sounds/firework.wav");
  preload(Sound.Place, "sounds/place.wav", 0.7);
  preload(Sound.Destroy, "sounds/destroy.wav", 0.7);
  preload(Sound.Hit, "sounds/hit.wav");
  preload(Sound.Sonar, "sounds/sonar.wav", 0.7);
  preload(Sound.Thunder, "sounds/thunder.wav", 0.7);
};

export const playSoundOnEvent = (
  event: GameEvent,
  alias: Sound,
  options?: PlayOptions
) => {
  EventSystem.Instance.addEventListener(event, () =>
    sound.play(alias, options)
  );
};
