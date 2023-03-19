import Manager from "../controllers/manager";
import VisibilityController from "../controllers/visibilityController";
import { GameEvent } from "../events";
import EventSystem from "../eventSystem";
import { FREE_TILES_INCLUDING_BUILDINGS } from "../terrain/constants";
import { createStoneSurface } from "../terrain/fill";
import Tile, { TileWithStaticEntity } from "../terrain/tile";
import { AgentCategory, EntityType } from "./constants";
import Shockwave from "./projectiles/shockwave";
import StaticEntity, { StaticAgent } from "./staticEntity";

const INVINCIBLE_TIME = 1000;
const DAMAGE = 200;

const TILES = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
const CORNERS = [
  [
    [-1, 0],
    [-1, -1],
    [0, -1],
  ],
  [
    [0, -1],
    [1, -1],
    [1, 0],
  ],
  [
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  [
    [0, 1],
    [-1, 1],
    [-1, 0],
  ],
];

class Base implements StaticAgent {
  public static scale = 2;
  public static baseEmergencyRepair = 15;

  public entity: StaticEntity;
  public category = AgentCategory.Player;
  public hp = 30;
  private invincibleTime = 0;
  public renderData = {};

  private baseParts = new Set<StaticAgent>();
  private basePartsByType = new Map<EntityType, number>();

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
    this.baseParts.add(this);
  }

  tick(dt: number) {
    this.invincibleTime = Math.max(0, this.invincibleTime - dt);
  }

  getType(): EntityType {
    return EntityType.Base;
  }

  getTile() {
    return this.tile as TileWithStaticEntity;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  getHp() {
    return this.hp;
  }

  spawn() {
    VisibilityController.Instance.registerAgent(this);
    createStoneSurface(this, 4);
  }

  despawn() {
    VisibilityController.Instance.removeAgent(this);
  }

  hit(damage: number) {
    if (this.invincibleTime > 0 || this.hp <= 0) {
      return;
    }

    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.showMessage("You lose!", {
        closable: false,
        expires: 0,
      });

      // The entire map should now be visible
      Manager.Instance.getSurface().forceRerender();
      EventSystem.Instance.triggerEvent(GameEvent.Lose);
    } else {
      this.invincibleTime = INVINCIBLE_TIME;
      this.shockwave();
    }

    Manager.Instance.triggerStatUpdate();
    EventSystem.Instance.triggerEvent(GameEvent.HitBase);
  }

  regenerate(multiplier = 1) {
    this.hp += this.getRegenerationFactor() * multiplier;
  }

  isVisible() {
    return true;
  }

  isDestroyed() {
    return this.hp <= 0;
  }

  addPart(part: StaticAgent) {
    this.baseParts.add(part);
    this.basePartsByType.set(
      part.getType(),
      (this.basePartsByType.get(part.getType()) ?? 0) + 1
    );
  }

  removePart(part: StaticAgent) {
    this.baseParts.delete(part);
    this.basePartsByType.set(
      part.getType(),
      this.basePartsByType.get(part.getType())! - 1
    );
  }

  getParts() {
    return this.baseParts;
  }

  getPartsCount(type: EntityType) {
    return this.basePartsByType.get(type) ?? 0;
  }

  getRegenerationFactor() {
    const armories = this.getPartsCount(EntityType.Armory);
    const barracks = this.getPartsCount(EntityType.Barracks);

    // Diminishing returns
    return (
      (armories * 50) / (armories + 25) + (barracks * 50) / (barracks + 25)
    );
  }

  getMoneyFactor() {
    const markets = this.getPartsCount(EntityType.Market);

    // Diminishing returns
    return 1 + (markets * 2.5) / (markets + 25);
  }

  private shockwave() {
    const surface = Manager.Instance.getSurface();
    const targets = new Map<string, [Tile, Tile]>();

    this.baseParts.forEach((agent) => {
      TILES.forEach(([x, y], i) => {
        const source = surface.getTile(
          agent.getTile().getX() + x,
          agent.getTile().getY() + y
        )!;

        CORNERS[i].forEach(([x2, y2]) => {
          const target = surface.getTile(
            agent.getTile().getX() + x + x2,
            agent.getTile().getY() + y + y2
          );

          if (
            target &&
            !targets.has(target.getHash()) &&
            FREE_TILES_INCLUDING_BUILDINGS.has(target.getType())
          ) {
            targets.set(target.getHash(), [source, target]);
          }
        });
      });
    });

    targets.forEach(([fromTile, toTile]) => {
      const shockwave = new Shockwave(fromTile, toTile, DAMAGE);
      surface.spawn(shockwave);
    });
  }
}

export default Base;
