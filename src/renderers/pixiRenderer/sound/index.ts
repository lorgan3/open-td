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
  Tank = "tankSnd",
  Drill = "drillSnd",
  Lock = "lockSnd",
  TitleMusic = "titleMusic",
  BossMusic = "bossMusic",
}

export const soundAssets = {
  [Sound.Notification]: `${import.meta.env.BASE_URL}sounds/notification.mp3`,
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
  [Sound.Tank]: `${import.meta.env.BASE_URL}sounds/tank.wav`,
  [Sound.Drill]: `${import.meta.env.BASE_URL}sounds/drill.wav`,
  [Sound.Lock]: `${import.meta.env.BASE_URL}sounds/lock.mp3`,
};

export const musicAssets = {
  [Sound.TitleMusic]: `${import.meta.env.BASE_URL}music/title.mp3`,
  [Sound.BossMusic]: `${import.meta.env.BASE_URL}music/boss.mp3`,
};

export const VOLUMES: Record<Sound, number> = {
  [Sound.Shot]: 0.7,
  [Sound.Laser]: 0.5,
  [Sound.Flamethrower]: 0.1,
  [Sound.Mortar]: 0.7,
  [Sound.Railgun]: 0.7,
  [Sound.Place]: 0.7,
  [Sound.Destroy]: 0.7,
  [Sound.Sonar]: 0.7,
  [Sound.Thunder]: 0.7,
  [Sound.Tank]: 0.1,
  [Sound.Lock]: 1,
  [Sound.TitleMusic]: 1,
  [Sound.BossMusic]: 1,
  [Sound.Notification]: 1,
  [Sound.Firework]: 1,
  [Sound.Explosion]: 1,
  [Sound.Hit]: 1,
  [Sound.Bush]: 1,
  [Sound.Drill]: 1,
};

export const updateVolume = (alias: Sound, volume: number) => {
  sound.volume(alias, VOLUMES[alias] * volume);
};

export const playSoundOnEvent = (
  event: GameEvent,
  alias: Sound,
  options?: PlayOptions
) =>
  EventSystem.Instance.addEventListener(event, () => {
    if (sound.exists(alias)) {
      sound.play(alias, options);
    }
  });

export const fade = (alias: Sound, duration = 0.5) => {
  const s = sound.find(alias);
  const initialVolume = s.volume;
  const step = initialVolume / duration / 20;

  const timer = window.setInterval(() => {
    s.volume -= step;

    if (s.volume <= 0) {
      s.stop();
      window.clearInterval(timer);
    }
  }, 50);
};
