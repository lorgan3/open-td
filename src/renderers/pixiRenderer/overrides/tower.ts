import { AnimatedSprite, Loader, Sprite } from "pixi.js";
import { EntityRenderer } from ".";

import { EntityType } from "../../../data/entity/entity";
import { getCenter } from "../../../data/entity/staticEntity";
import { ITower } from "../../../data/entity/towers";
import { clampDegrees } from "../../../data/util/math";
import { SCALE } from "../renderer";
import { ATLAS_NAME } from "./default";

const TOWER_TO_ATLAS_MAP = new Map<EntityType, string>([
  [EntityType.Tower, "turret"],
  [EntityType.Flamethrower, "flamethrower"],
  [EntityType.Laser, "laser"],
  [EntityType.Mortar, "mortar"],
  [EntityType.Railgun, "railgun"],
]);

const ANIMATION_SPEED = 0.1;
const ROTATION_SPEED = 0.6;

const BASE_SPEED_DAMAGE_BOOST = "buildings8.png";
const BASE_SPEED_BOOST = "buildings9.png";
const BASE_DAMAGE_BOOST = "buildings10.png";
const BASE = "buildings11.png";

const getBaseSprite = (isSpeedBoosted: boolean, isDamagedBoosted: boolean) => {
  if (isSpeedBoosted) {
    return isDamagedBoosted ? BASE_SPEED_DAMAGE_BOOST : BASE_SPEED_BOOST;
  }

  return isDamagedBoosted ? BASE_DAMAGE_BOOST : BASE;
};

const createTurretSprite = (data: ITower, loader: Loader) => {
  const atlasName = TOWER_TO_ATLAS_MAP.get(data.getType())!;
  const turret = new AnimatedSprite(
    Object.values(loader.resources[atlasName].spritesheet!.textures)
  );
  turret.pivot = { x: SCALE, y: SCALE };
  turret.animationSpeed = ANIMATION_SPEED;
  turret.loop = false;
  turret.position.set(SCALE, SCALE);

  turret.onComplete = () => {
    turret.gotoAndStop(0);
  };

  return turret;
};

class Tower extends Sprite implements EntityRenderer {
  private turret: AnimatedSprite;

  constructor(private data: ITower, private loader: Loader) {
    super(
      loader.resources[ATLAS_NAME].spritesheet!.textures[
        getBaseSprite(data.isSpeedBoosted(), data.isDamageBoosted())
      ]
    );

    const [x, y] = getCenter(data);
    this.position.set(x * SCALE, y * SCALE);
    this.pivot = { x: SCALE, y: SCALE };

    this.turret = createTurretSprite(data, loader);
    this.addChild(this.turret);
  }

  sync(dt: number, full: boolean) {
    if (full) {
      this.texture =
        this.loader.resources[ATLAS_NAME].spritesheet!.textures[
          getBaseSprite(this.data.isSpeedBoosted(), this.data.isDamageBoosted())
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
    }
  }
}

export { Tower };
