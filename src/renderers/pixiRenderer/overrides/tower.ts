import { AnimatedSprite, Sprite } from "pixi.js";
import { EntityType } from "../../../data/entity/constants";
import { getCenter } from "../../../data/entity/staticEntity";
import { ITower } from "../../../data/entity/towers";
import { clampDegrees } from "../../../data/util/math";
import { BASE, TOWERS } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { Sound } from "../sound";
import { ControllableSound } from "../sound/controllableSound";
import { AssetsContainer } from "../assets/container";
import { ATLAS, AtlasTile } from "../atlas";
import Renderer from "../renderer";
import { Explosion } from "../explosion";

const TOWER_TO_ATLAS_MAP = new Map<EntityType, string>([
  [EntityType.Tower, "turret"],
  [EntityType.Flamethrower, "flamethrower"],
  [EntityType.Laser, "laser"],
  [EntityType.Mortar, "mortar"],
  [EntityType.Railgun, "railgun"],
  [EntityType.Tesla, "tesla"],
]);

const TOWER_TO_SOUND_MAP = new Map<EntityType, Sound>([
  [EntityType.Tower, Sound.Shot],
  [EntityType.Flamethrower, Sound.Flamethrower],
  [EntityType.Laser, Sound.Laser],
  [EntityType.Mortar, Sound.Mortar],
  [EntityType.Railgun, Sound.Railgun],
  [EntityType.Tesla, Sound.Thunder],
]);

const LOOPING_TOWERS = new Set([EntityType.Flamethrower, EntityType.Laser]);

const ANIMATION_SPEED = 0.1;
const ROTATION_SPEED = 0.6;

const getFrameSprite = (isSpeedBoosted: boolean, isDamagedBoosted: boolean) => {
  if (isSpeedBoosted) {
    return isDamagedBoosted ? AtlasTile.FrameSpeedDamage : AtlasTile.FrameSpeed;
  }

  return isDamagedBoosted ? AtlasTile.FrameDamage : AtlasTile.Frame;
};

class Tower extends Sprite implements EntityRenderer {
  public static readonly layer = BASE;

  private turret!: AnimatedSprite;
  private sound?: ControllableSound;

  constructor(private data: ITower, private container: AssetsContainer) {
    super(
      container.assets![ATLAS].textures[
        getFrameSprite(data.isSpeedBoosted(), data.isDamageBoosted())
      ]
    );

    const [x, y] = getCenter(data);
    this.position.set(x * SCALE, y * SCALE);
    this.pivot = { x: SCALE, y: SCALE };

    this.createTurret();

    this.on("removed", () => {
      if (data.renderData.destroyed) {
        new Explosion(container, ...getCenter(data), 2);
      }

      TOWERS.removeChild(this.turret);

      if (this.sound) {
        this.sound.destroy();
      }
    });
  }

  private createTurret() {
    const atlasName = TOWER_TO_ATLAS_MAP.get(this.data.getType())!;
    this.turret = new AnimatedSprite(
      Object.values(this.container.assets![atlasName].textures) as any
    );

    this.turret.position.set(this.x, this.y);
    this.turret.pivot = { x: SCALE, y: SCALE };
    this.turret.animationSpeed = ANIMATION_SPEED;
    this.turret.loop = false;

    this.turret.onComplete = () => {
      this.turret.gotoAndStop(0);
    };

    TOWERS.addChild(this.turret);
  }

  sync(dt: number, full: boolean) {
    if (full) {
      this.texture =
        this.container.assets![ATLAS].textures[
          getFrameSprite(
            this.data.isSpeedBoosted(),
            this.data.isDamageBoosted()
          )
        ];
    }

    this.turret.angle = clampDegrees(
      this.turret.angle,
      this.data.entity.getRotation(),
      ROTATION_SPEED * dt
    );

    if (this.data.renderData.fired) {
      this.data.renderData.fired = false;
      this.turret.play();

      if (LOOPING_TOWERS.has(this.data.getType())) {
        if (!this.sound) {
          this.sound = ControllableSound.fromEntity(
            this.data.entity,
            TOWER_TO_SOUND_MAP.get(this.data.getType())!,
            {
              loop: true,
            }
          );
        } else {
          this.sound.update(this.data.entity);
        }
      } else {
        ControllableSound.fromEntity(
          this.data.entity,
          TOWER_TO_SOUND_MAP.get(this.data.getType())!
        );
      }
    } else if (this.sound) {
      if (this.sound.fade(dt)) {
        this.sound = undefined;
      }
    }
  }
}

export { Tower };
