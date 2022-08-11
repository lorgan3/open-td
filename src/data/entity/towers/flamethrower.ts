import { coverTilesWithTowerSightLines, ITower } from ".";
import { isSolid } from "../../terrain/collision";
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
    coverTilesWithTowerSightLines(this, RANGE, isSolid);
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
