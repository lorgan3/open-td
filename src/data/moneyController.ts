import { IEnemy } from "./entity/enemies";
import { EntityType } from "./entity/entity";

export const TOWER_PRICES: Partial<Record<EntityType, number>> = {
  [EntityType.Fence]: 1,
  [EntityType.Wall]: 3,
  [EntityType.ElectricFence]: 9,
  [EntityType.Freezer]: 4,
  [EntityType.Tower]: 10,
  [EntityType.Flamethrower]: 15,
  [EntityType.Mortar]: 30,
  [EntityType.Railgun]: 50,
  [EntityType.Radar]: 50,
  [EntityType.PowerPlant]: 20,
  [EntityType.Armory]: 50,
  [EntityType.Market]: 20,
};

class MoneyController {
  constructor(private money = 0, private multiplier = () => 1) {}

  setMoney(amount: number) {
    this.money = amount;
  }

  addMoney(amount: number) {
    this.money += amount;
  }

  removeMoney(amount: number) {
    if (amount > this.money) {
      throw new Error("Not enough money!");
    }

    this.money -= amount;
  }

  registerEnemyKill(enemy: IEnemy) {
    const amount = this.getEnemyValue(enemy) * this.multiplier();
    this.money += amount;
  }

  getMoney() {
    return this.money;
  }

  getMultiplier() {
    return this.multiplier();
  }

  private getEnemyValue(enemy: IEnemy): number {
    switch (enemy.getType()) {
      case EntityType.Slime:
        return 3;
      default:
        throw new Error("Entity is not an enemy");
    }
  }
}

export default MoneyController;
