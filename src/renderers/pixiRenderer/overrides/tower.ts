import { AnimatedSprite, Loader, Sprite } from "pixi.js";
import { EntityType } from "../../../data/entity/constants";
import { getCenter } from "../../../data/entity/staticEntity";
import { ITower } from "../../../data/entity/towers";
import { clampDegrees } from "../../../data/util/math";
import { BASE, TOWERS } from "../layer";
import { SCALE } from "../constants";
import { ATLAS_NAME } from "./default";
import { EntityRenderer } from "./types";

const TOWER_TO_ATLAS_MAP = new Map<EntityType, string>([
  [EntityType.Tower, "turret"],
  [EntityType.Flamethrower, "flamethrower"],
  [EntityType.Laser, "laser"],
  [EntityType.Mortar, "mortar"],
  [EntityType.Railgun, "railgun"],
]);

const ANIMATION_SPEED = 0.1;
const ROTATION_SPEED = 0.6;

const FRAME_SPEED_DAMAGE_BOOST = "buildings8.png";
const FRAME_SPEED_BOOST = "buildings9.png";
const FRAME_DAMAGE_BOOST = "buildings10.png";
const FRAME = "buildings11.png";

const getFrameSprite = (isSpeedBoosted: boolean, isDamagedBoosted: boolean) => {
  if (isSpeedBoosted) {
    return isDamagedBoosted ? FRAME_SPEED_DAMAGE_BOOST : FRAME_SPEED_BOOST;
  }

  return isDamagedBoosted ? FRAME_DAMAGE_BOOST : FRAME;
};

class Tower extends Sprite implements EntityRenderer {
  public static readonly layer = BASE;

  private turret!: AnimatedSprite;

  constructor(private data: ITower, private loader: Loader) {
    super(
      loader.resources[ATLAS_NAME].spritesheet!.textures[
        getFrameSprite(data.isSpeedBoosted(), data.isDamageBoosted())
      ]
    );

    const [x, y] = getCenter(data);
    this.position.set(x * SCALE, y * SCALE);
    this.pivot = { x: SCALE, y: SCALE };

    this.createTurret();
  }

  private createTurret() {
    const atlasName = TOWER_TO_ATLAS_MAP.get(this.data.getType())!;
    this.turret = new AnimatedSprite(
      Object.values(this.loader.resources[atlasName].spritesheet!.textures)
    );

    this.turret.position.set(this.x, this.y);
    this.turret.pivot = { x: SCALE, y: SCALE };
    this.turret.animationSpeed = ANIMATION_SPEED;
    this.turret.loop = false;

    this.turret.onComplete = () => {
      this.turret.gotoAndStop(0);
    };

    TOWERS.addChild(this.turret);
    this.on("removed", () => TOWERS.removeChild(this.turret));
  }

  sync(dt: number, full: boolean) {
    if (full) {
      this.texture =
        this.loader.resources[ATLAS_NAME].spritesheet!.textures[
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
    }
  }
}

export { Tower };
