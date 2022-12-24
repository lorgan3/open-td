import { filters, IMediaInstance, PlayOptions, sound } from "@pixi/sound";
import Entity from "../../../data/entity/entity";
import { DEFAULT_SCALE, SCALE } from "../constants";
import Renderer from "../renderer";
import { Sound } from ".";

class ControllableSound {
  private ref?: IMediaInstance;
  private promise?: Promise<IMediaInstance>;

  static getSoundOptions(entity: Entity) {
    const { x, y, width, height, scale } = Renderer.Instance.getViewport();

    const horizontalDirection = (entity.getX() * SCALE - x) / (width / 2);
    const verticalDirection = (entity.getY() * SCALE - y) / (height / 2);

    const overflow =
      1 /
      (1 +
        (Math.max(0, Math.abs(horizontalDirection) - 1) +
          Math.max(0, Math.abs(verticalDirection) - 1)) *
          3);
    const volume = (Math.min(scale, DEFAULT_SCALE) / DEFAULT_SCALE) * overflow;

    // The middle 50% of the screen is played centered, then we start panning in the direction of the entity.
    const pan =
      Math.min(1, Math.max(0, Math.abs(horizontalDirection) - 0.5)) *
      Math.sign(horizontalDirection);

    return { volume, pan };
  }

  static fromEntity(entity: Entity, alias: Sound, options?: PlayOptions) {
    const { volume, pan } = ControllableSound.getSoundOptions(entity);

    // Sounds that are too quiet are not played.
    if (volume < 0.25) {
      return;
    }

    return new ControllableSound(alias, new filters.StereoFilter(pan), {
      ...options,
      volume: volume,
    });
  }

  constructor(
    alias: Sound,
    private filter: filters.StereoFilter,
    options: PlayOptions
  ) {
    const promiseOrRef = sound.play(alias, { ...options, filters: [filter] });

    if (promiseOrRef instanceof Promise) {
      promiseOrRef.then((ref) => (this.ref = ref));
      this.promise = promiseOrRef;
    } else {
      this.ref = promiseOrRef;
    }
  }

  destroy() {
    if (this.ref) {
      this.ref?.destroy();
    } else {
      this.promise!.then((ref) => ref.destroy());
    }
  }

  update(entity: Entity) {
    if (this.ref) {
      const { volume, pan } = ControllableSound.getSoundOptions(entity);
      this.ref.volume = volume;
      this.filter.pan = pan;
    }
  }

  fade(dt: number, duration = 500) {
    if (!this.ref) {
      return false;
    }

    this.ref.volume -= (dt / duration) * 0.8;

    if (this.ref.volume < 0.2) {
      this.destroy();
      return true;
    }

    return false;
  }
}

export { ControllableSound };
