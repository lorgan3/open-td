import { ParticleContainer, Sprite } from "pixi.js";
import FlameData from "../../../data/entity/projectiles/flame";
import { PROJECTILES } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { AssetsContainer } from "../assets/container";
import { ATLAS, AtlasTile } from "../atlas";

const MAX_FLAMES = 20;

class FireParticle extends Sprite {
  public speed = 0;
  public lifetime = 0;
  public direction = 0;
}

class Flame extends ParticleContainer implements EntityRenderer {
  public static readonly layer = PROJECTILES;

  constructor(private data: FlameData, container: AssetsContainer) {
    super(MAX_FLAMES, {
      position: true,
      scale: true,
      rotation: true,
      alpha: true,
    });

    for (let i = 0; i < MAX_FLAMES; i++) {
      const particle = new FireParticle(
        container.assets![ATLAS].textures[AtlasTile.Fire]
      );

      particle.anchor.set(0.5);
      particle.scale.set(1 + Math.random() * 0.3);
      particle.speed = (4 + Math.random() * 2) * 0.0017;
      particle.alpha = 0.8;
      particle.lifetime = Math.floor(Math.random() * 25);
      particle.x = this.data.sourceX * SCALE;
      particle.y = this.data.sourceY * SCALE;
      particle.direction =
        ((this.data.entity.getRotation() + 20 - Math.random() * 40) * Math.PI) /
        180;

      this.addChild(particle);
    }
  }

  sync(dt: number) {
    (this.children as FireParticle[]).forEach((particle) => {
      particle.x += Math.sin(particle.direction) * particle.speed * dt * SCALE;
      particle.y += Math.cos(particle.direction) * particle.speed * dt * SCALE;
      particle.lifetime += 1;
      if (particle.lifetime > 25) {
        if (this.data.renderData.update) {
          particle.lifetime = 0;
          particle.x = this.data.sourceX * SCALE;
          particle.y = this.data.sourceY * SCALE;

          particle.direction =
            ((this.data.entity.getRotation() + 20 - Math.random() * 40) *
              Math.PI) /
            180;
          particle.alpha = 0.8;
        } else {
          particle.lifetime = Math.floor(Math.random() * 25);
          particle.alpha = 0;
        }
      }
    });

    this.data.renderData.update = false;
  }
}

export { Flame };
