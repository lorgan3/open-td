import {
  coverTilesWithTowerSightLines,
  getDamageMultiplier,
  getSpeedMultiplier,
  ITower,
} from ".";
import Manager from "../../controllers/manager";
import { isSolid } from "../../terrain/collision";
import Tile, { TileWithStaticEntity } from "../../terrain/tile";
import { IEnemy } from "../enemies";
import Entity, { RenderData } from "../entity";
import { AgentCategory, EntityType } from "../constants";
import StaticEntity, { getCenter, StaticAgent } from "../staticEntity";
import { getSquareDistance } from "../../util/distance";
import Spark from "../projectiles/spark";

const COOLDOWN = 4000;
const CHARGE_TIME = 700;
const DAMAGE = 50;

class Tesla implements ITower {
  public static readonly scale = 2;
  public static readonly range = 8;

  public entity: StaticEntity;
  public category = AgentCategory.Player;
  private cooldown = 0;
  private cleanupEventListener?: () => void;
  private coveredTiles?: Set<Tile>;
  private hp = 160;
  private isEnabled = true;
  private speedMultiplier = 1;
  private damageMultiplier = 1;
  public renderData: RenderData = {};
  private charging = false;

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
  }

  tick(dt: number) {
    if (!this.isEnabled || this.cooldown <= 0) {
      return;
    }

    this.cooldown -= dt * (this.charging ? 1 : this.speedMultiplier);

    if (this.charging && COOLDOWN - this.cooldown > CHARGE_TIME) {
      this.charging = false;

      const surface = Manager.Instance.getSurface();
      const targets = [
        ...Manager.Instance.getSurface().getEntitiesForCategory(
          AgentCategory.Enemy
        ),
      ].filter((enemy) =>
        this.coveredTiles!.has(
          surface.getTile(enemy.getAlignedX(), enemy.getAlignedY())!
        )
      );

      const distances = new Map<number, number>();
      targets.forEach((target) =>
        distances.set(
          target.getId(),
          getSquareDistance(target.getX(), target.getY(), ...getCenter(this))
        )
      );

      const chains: Entity[][] = [];
      targets
        .sort((a, b) => distances.get(a.getId())! - distances.get(b.getId())!)
        .forEach((target) => {
          let minDist = distances.get(target.getId())!;
          let closestChain: Entity[] | undefined;

          chains.forEach((chain) => {
            const last = chain[chain.length - 1];
            const dist = getSquareDistance(
              target.getX(),
              target.getY(),
              last.getX(),
              last.getY()
            );
            if (dist < minDist) {
              minDist = dist;
              closestChain = chain;
            }
          });

          if (closestChain) {
            closestChain.push(target);
          } else {
            chains.push([this.entity, target]);
          }
        });

      const damage = DAMAGE * this.damageMultiplier;
      chains.forEach((chain) => {
        const spark = new Spark(
          this,
          chain
            .slice(1, chain.length)
            .map((entity) => entity.getAgent() as IEnemy),
          damage
        );
        Manager.Instance.getSurface().spawn(spark);
      });
    }
  }

  fire() {
    this.cooldown += COOLDOWN;

    if (
      !Manager.Instance.consume(
        this,
        this.speedMultiplier,
        this.damageMultiplier
      )
    ) {
      return 0;
    }

    this.charging = true;
    this.renderData.fired = true;

    return 0;
  }

  spawn() {
    [this.cleanupEventListener, this.coveredTiles] =
      coverTilesWithTowerSightLines(this, Tesla.range, isSolid);
  }

  despawn() {
    this.cleanupEventListener?.();
  }

  updateLinkedAgents(linkedAgents: Set<StaticAgent>) {
    this.speedMultiplier = getSpeedMultiplier(linkedAgents);
    this.damageMultiplier = getDamageMultiplier(linkedAgents);
  }

  getCooldown() {
    return this.cooldown;
  }

  getType(): EntityType {
    return EntityType.Tesla;
  }

  hit(damage: number) {
    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.getSurface().despawnStatic(this);
    }
  }

  isVisible() {
    return true;
  }

  getTile() {
    return this.tile as TileWithStaticEntity;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.cooldown = COOLDOWN;
    this.isEnabled = false;
  }

  isSpeedBoosted() {
    return this.speedMultiplier > 1;
  }

  isDamageBoosted() {
    return this.damageMultiplier > 1;
  }
}

export default Tesla;
