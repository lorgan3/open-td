import { Container, Loader, ParticleContainer, Sprite } from "pixi.js";

import { SCALE } from "../constants";
import { UI } from "../layer";
import { EntityRenderer } from "./types";
import WavePointData from "../../../data/entity/wavePoint";
import { ATLAS, AtlasTile } from "../atlas";

const PARTICLE_COUNT = 75;
const PARTICLE_SPEED = 0.002;
const PARTICLE_LIFETIME = 1000;

class WavePoint extends Container implements EntityRenderer {
  public static readonly layer = UI;

  private container: ParticleContainer;
  private sprite: Sprite;
  private time = 0;

  constructor(private data: WavePointData, loader: Loader) {
    super();

    this.sprite = new Sprite(
      loader.resources[ATLAS].spritesheet!.textures[AtlasTile.Coin]
    );
    this.sprite.anchor.set(0.5);

    this.container = new ParticleContainer(PARTICLE_COUNT, { alpha: true });
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = new Sprite(
        loader.resources[ATLAS].spritesheet!.textures[AtlasTile.SporeParticle]
      );

      const angle = ((i % 25) / 25) * Math.PI * 2;
      const length = Math.floor(i / 25) * 0.75;

      particle.anchor.set(0.5);
      particle.alpha = 0.9;
      particle.x = (this.data.sourceX + Math.sin(angle) * length) * SCALE;
      particle.y = (this.data.sourceY + Math.cos(angle) * length) * SCALE;

      this.container.addChild(particle);
    }

    this.addChild(this.sprite, this.container);
  }

  sync(dt: number) {
    this.sprite.position.set(
      this.data.entity.getX() * SCALE,
      this.data.entity.getY() * SCALE
    );
    this.sprite.angle = this.data.entity.getRotation();

    this.container.children.forEach((particle, i) => {
      const angle = ((i % 25) / 25) * Math.PI * 2;

      particle.x += Math.sin(angle) * PARTICLE_SPEED * dt * SCALE;
      particle.y += Math.cos(angle) * PARTICLE_SPEED * dt * SCALE;
      particle.alpha = 0.9 - (this.time / PARTICLE_LIFETIME) * 0.8;
    });

    this.time += dt;
    if (this.time > PARTICLE_LIFETIME) {
      this.removeChild(this.container);
    }
  }
}

export { WavePoint };
