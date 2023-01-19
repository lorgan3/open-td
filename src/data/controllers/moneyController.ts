import Blueprint, { isBlueprint } from "../entity/blueprint";
import { Agent } from "../entity/entity";
import { GameEvent } from "../events";
import Manager from "./manager";
import { CONVERT_MONEY_AMOUNT } from "../placeables";
import { EntityType } from "../entity/constants";
import EventSystem from "../eventSystem";

export const TOWER_PRICES: Partial<Record<EntityType, number>> = {
  [EntityType.Fence]: 1,
  [EntityType.Wall]: 4,
  [EntityType.ElectricFence]: 9,
  [EntityType.Freezer]: 6,
  [EntityType.Tower]: 12,
  [EntityType.Flamethrower]: 18,
  [EntityType.Mortar]: 40,
  [EntityType.Railgun]: 60,
  [EntityType.Radar]: 20,
  [EntityType.PowerPlant]: 20,
  [EntityType.Armory]: 50,
  [EntityType.Market]: 30,
  [EntityType.SpeedBeacon]: 50,
  [EntityType.DamageBeacon]: 40,
  [EntityType.Laser]: 25,
  [EntityType.Barracks]: 15,
  [EntityType.Tesla]: 50,
};

const SELL_MULTIPLIER = 0.5;

const WAVE_BUDGET = 20;

class MoneyController {
  private static instance: MoneyController;

  private recentlyBought = new Set<Agent>();

  constructor(private money = 0, private multiplier = () => 1) {
    MoneyController.instance = this;

    EventSystem.Instance.addEventListener(GameEvent.Unlock, ({ placeable }) => {
      if (placeable.entityType === EntityType.Convert) {
        this.addMoney(CONVERT_MONEY_AMOUNT);
        Manager.Instance.triggerStatUpdate();
      }
    });
  }

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

  addWaveBudget(level: number) {
    this.addMoney(
      (WAVE_BUDGET + (WAVE_BUDGET * level) / 3) * this.multiplier()
    );
  }

  buy(agent: Agent) {
    let type = agent.getType();
    if (isBlueprint(agent)) {
      type = agent.getPlaceable().entityType;
    }

    const cost = TOWER_PRICES[type] ?? 0;

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
      this.addMoney(this.getValue(agent));
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

  getValue(agent: Agent) {
    const price = TOWER_PRICES[agent.getType()] ?? 0;
    return price * (this.recentlyBought.has(agent) ? 1 : SELL_MULTIPLIER);
  }

  static get Instance() {
    return this.instance;
  }
}

export default MoneyController;
