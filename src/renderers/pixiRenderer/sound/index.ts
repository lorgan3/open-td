import { PlayOptions, sound } from "@pixi/sound";
import { GameEvent } from "../../../data/events";
import EventSystem from "../../../data/eventSystem";

export enum Sound {
  Notification = "notificationSnd",
  Shot = "shotSnd",
  Laser = "laserSnd",
  Flamethrower = "flamethrowerSnd",
  Mortar = "mortarSnd",
  Railgun = "railgunSnd",
  Explosion = "explosionSnd",
  Firework = "fireworkSnd",
  Place = "placeSnd",
  Destroy = "destroySnd",
  Hit = "hitSnd",
  Sonar = "sonarSnd",
  Thunder = "thunderSnd",
  Bush = "bushSnd",
}

export const soundAssets = {
  [Sound.Notification]: `${import.meta.env.BASE_URL}sounds/notification.ogg`,
  [Sound.Shot]: `${import.meta.env.BASE_URL}sounds/shot.wav`,
  [Sound.Laser]: `${import.meta.env.BASE_URL}sounds/laser.mp3`,
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
  [Sound.Bush]: `${import.meta.env.BASE_URL}sounds/bush.mp3`,
};

const updateVolume = (alias: Sound, volume: number) => {
  sound.volume(alias, volume);
};

export const init = () => {
  updateVolume(Sound.Shot, 0.7);
  updateVolume(Sound.Laser, 0.5);
  updateVolume(Sound.Flamethrower, 0.1);
  updateVolume(Sound.Mortar, 0.7);
  updateVolume(Sound.Railgun, 0.7);
  updateVolume(Sound.Place, 0.7);
  updateVolume(Sound.Destroy, 0.7);
  updateVolume(Sound.Sonar, 0.7);
  updateVolume(Sound.Thunder, 0.7);
};

export const playSoundOnEvent = (
  event: GameEvent,
  alias: Sound,
  options?: PlayOptions
) =>
  EventSystem.Instance.addEventListener(event, () =>
    sound.play(alias, options)
  );
