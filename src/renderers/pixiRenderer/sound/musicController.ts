import { sound } from "@pixi/sound";
import { Sound, VOLUMES, fade } from ".";

class MusicController {
  private static instance: MusicController;

  private currentSounds: Sound[] = [];
  private currentSound: Sound | null = null;
  private volume = 1;

  static get Instance() {
    return this.instance;
  }

  constructor() {
    MusicController.instance = this;
  }

  queue(sounds: Sound[]) {
    if (
      !this.currentSounds.some((currentSound) => sounds.includes(currentSound))
    ) {
      this.currentSounds = sounds;

      if (this.currentSound) {
        fade(this.currentSound).then(() => this.playNextSound());
      } else {
        this.playNextSound();
      }
    }

    this.currentSounds = sounds;
  }

  play() {
    if (!this.currentSound) {
      this.playNextSound();
      return;
    }

    const instance = sound.find(this.currentSound);
    if (!instance.isPlaying) {
      instance.play();
      return;
    }
  }

  pause() {
    if (this.currentSound) {
      sound.pause(this.currentSound);
    }
  }

  stop() {
    if (this.currentSound) {
      sound.stop(this.currentSound);
      this.currentSound = null;
    }
  }

  updateVolume(volume: number) {
    this.volume = volume;

    if (this.currentSound) {
      sound.volume(this.currentSound, this.volume * VOLUMES[this.currentSound]);
    }
  }

  get isPlaying() {
    if (!this.currentSound) {
      return false;
    }

    const instance = sound.find(this.currentSound);
    return instance.isPlaying;
  }

  private playNextSound() {
    const options =
      this.currentSounds.length === 1
        ? this.currentSounds
        : this.currentSounds.filter((sound) => sound !== this.currentSound);

    this.currentSound = options[Math.floor(Math.random() * options.length)];

    sound.volume(this.currentSound, this.volume * VOLUMES[this.currentSound]);
    sound.play(this.currentSound, {
      complete: () => {
        this.playNextSound();
      },
    });
  }
}

export default MusicController;
