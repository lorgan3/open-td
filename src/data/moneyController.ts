import { IEnemy } from "./entity/enemies";
import { EntityType } from "./entity/entity";

class MoneyController {
  constructor(private money = 0) {}

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
    const amount = this.getEnemyValue(enemy);
    this.money += amount;
  }

  getMoney() {
    return this.money;
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
