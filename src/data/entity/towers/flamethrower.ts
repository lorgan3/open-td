import { ITower } from ".";
import Manager from "../../manager";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import Entity, { AgentCategory, EntityType } from "../entity";

const RANGE = 3;
const COOLDOWN = 1;
const DAMAGE = 0.5;

class Flamethrower implements ITower {
  public entity: Entity;
  public category = AgentCategory.Player;
  private cooldown = 0;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);

    Manager.Instance.getSurface().forCircle(
      tile.getX(),
      tile.getY(),
      RANGE,
      (tile) => tile.addTower(this)
    );
  }

  tick(dt: number) {
    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  fire(target: IEnemy) {
    this.cooldown = COOLDOWN;
    target.hit(DAMAGE);

    return DAMAGE;
  }

  getCooldown() {
    return this.cooldown;
  }

  getType(): EntityType {
    return EntityType.Flamethrower;
  }
}

export default Flamethrower;
