import { BASE_ENTITIES, EntityType } from "../../../data/entity/constants";
import { Blueprint } from "./blueprint";
import { Flame } from "./flame";
import { Flier } from "./flier";
import { LaserBeam } from "./laserBeam";
import { Rail } from "./rail";
import { Regular } from "./regular";
import { Runner } from "./runner";
import { GenericProjectile } from "./genericProjectile";
import { Tank } from "./tank";
import { Tower } from "./tower";
import { Rocket } from "./rocket";
import { Constructor } from "./types";
import { WavePoint } from "./wavePoint";
import { Spark } from "./spark";
import { Wall } from "./wall";
import { Foliage } from "./foliage";
import { Stump } from "./stump";
import { Base } from "./base";
import { Behemoth } from "./behemoth";
import { Bore } from "./bore";

export const spriteOverrideAssets = {
  runner: `${import.meta.env.BASE_URL}animations/runner.json`,
  regular: `${import.meta.env.BASE_URL}animations/regular.json`,
  flier: `${import.meta.env.BASE_URL}animations/flier.json`,
  tank: `${import.meta.env.BASE_URL}animations/tank.json`,
  turret: `${import.meta.env.BASE_URL}animations/turret.json`,
  flamethrower: `${import.meta.env.BASE_URL}animations/flamethrower.json`,
  laser: `${import.meta.env.BASE_URL}animations/laser.json`,
  mortar: `${import.meta.env.BASE_URL}animations/mortar.json`,
  railgun: `${import.meta.env.BASE_URL}animations/railgun.json`,
  explosion: `${import.meta.env.BASE_URL}animations/explosion.json`,
  tesla: `${import.meta.env.BASE_URL}animations/tesla.json`,
  bore: `${import.meta.env.BASE_URL}animations/bore.json`,
};

export const OVERRIDES: Partial<Record<EntityType, Constructor | null>> = {
  [EntityType.Runner]: Runner,
  [EntityType.Slime]: Regular,
  [EntityType.Flier]: Flier,
  [EntityType.Tank]: Tank,
  [EntityType.Behemoth]: Behemoth,
  [EntityType.Bore]: Bore,
  [EntityType.Tower]: Tower,
  [EntityType.Flamethrower]: Tower,
  [EntityType.Laser]: Tower,
  [EntityType.Mortar]: Tower,
  [EntityType.Railgun]: Tower,
  [EntityType.Bullet]: GenericProjectile,
  [EntityType.Flame]: Flame,
  [EntityType.Rocket]: Rocket,
  [EntityType.Shockwave]: GenericProjectile,
  [EntityType.LaserBeam]: LaserBeam,
  [EntityType.Rail]: Rail,
  [EntityType.Fence]: Wall,
  [EntityType.Wall]: Wall,
  [EntityType.ElectricFence]: Wall,
  [EntityType.Blueprint]: Blueprint,
  [EntityType.WavePoint]: WavePoint,
  [EntityType.Spark]: Spark,
  [EntityType.Tesla]: Tower,
  [EntityType.Tree]: Foliage,
  [EntityType.Pine]: Foliage,
  [EntityType.Cactus]: Foliage,
  [EntityType.Stump]: Stump,
  [EntityType.Rock]: Foliage,
  [EntityType.Rock2]: Foliage,
  [EntityType.Rock3]: Foliage,
  [EntityType.Freezer]: null,
  ...[...BASE_ENTITIES].reduce(
    (entities, entity) => ({
      ...entities,
      [entity]: Base,
    }),
    {}
  ),
};
