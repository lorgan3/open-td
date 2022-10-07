import Blueprint from "./entity/Blueprint";
import { IEnemy } from "./entity/enemies";
import { Agent, EntityType } from "./entity/entity";

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
  [EntityType.SpeedBeacon]: 50,
  [EntityType.DamageBeacon]: 40,
  [EntityType.Laser]: 30,
};

const SELL_MULTIPLIER = 0.5;

class MoneyController {
  private recentlyBought = new Set<Agent>();

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

  buy(agent: Agent) {
    const cost = TOWER_PRICES[agent.getType()] ?? 0;

    if (cost > this.money) {
      throw new Error("Not enough money!");
    }

    this.removeMoney(cost);
    this.recentlyBought.add(agent);
  }

  replaceBlueprint(blueprint: Blueprint, actualAgent: Agent) {
    if (this.recentlyBought.has(blueprint)) {
      this.recentlyBought.delete(blueprint);
      this.recentlyBought.add(actualAgent);
    }
  }

  sell(agent: Agent) {
    if (agent instanceof Blueprint) {
      this.addMoney(TOWER_PRICES[agent.getPlaceable().entityType] ?? 0);
    } else {
      const price = TOWER_PRICES[agent.getType()] ?? 0;

      this.addMoney(
        price * (this.recentlyBought.has(agent) ? 1 : SELL_MULTIPLIER)
      );
    }
  }

  getMoney() {
    return this.money;
  }

  getMultiplier() {
    return this.multiplier();
  }

  clearRecents() {
    this.recentlyBought.clear();
  }

  isRecent(agent: Agent) {
    return this.recentlyBought.has(agent);
  }

  private getEnemyValue(enemy: IEnemy): number {
    switch (enemy.getType()) {
      case EntityType.Slime:
        return 5;
      case EntityType.Runner:
        return 3;
      case EntityType.Flier:
        return 6;
      case EntityType.Tank:
        return 8;
      default:
        throw new Error("Entity is not an enemy");
    }
  }
}

export default MoneyController;
