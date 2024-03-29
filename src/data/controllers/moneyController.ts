import Blueprint, { isBlueprint } from "../entity/blueprint";
import { Agent } from "../entity/entity";
import { GameEvent } from "../events";
import Manager from "./manager";
import { CONVERT_MONEY_AMOUNT } from "../placeables";
import { EntityType } from "../entity/constants";
import EventSystem from "../eventSystem";
import { Difficulty } from "../difficulty";

export const TOWER_PRICES: Partial<Record<EntityType, number>> = {
  [EntityType.Fence]: 1,
  [EntityType.Wall]: 3,
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

export interface MoneyControllerData {
  money: number | null;
}

class MoneyController {
  private static waveBudget = 20;
  private static sellMultiplier = 0.5;

  private static instance: MoneyController;

  private recentlyBought = new Set<Agent>();

  private removeUnlockEventListener: () => void;

  constructor(private money = 0, private multiplier = () => 1) {
    if (MoneyController.instance) {
      MoneyController.instance.removeUnlockEventListener();
    }

    MoneyController.instance = this;

    this.removeUnlockEventListener = EventSystem.Instance.addEventListener(
      GameEvent.Unlock,
      ({ placeable }) => {
        if (placeable.entityType === EntityType.Convert) {
          this.addMoney(CONVERT_MONEY_AMOUNT);
          Manager.Instance.triggerStatUpdate();
        }
      }
    );
  }

  setMoney(amount: number) {
    this.money = amount;
  }

  addMoney(amount: number) {
    this.money += amount;
  }

  addWaveBudget(level: number) {
    this.addMoney(
      Math.ceil(
        (MoneyController.waveBudget +
          (MoneyController.waveBudget * level) / 3) *
          this.multiplier()
      )
    );
  }

  buy(agent: Agent) {
    if (Manager.Instance.getDifficulty() === Difficulty.Practice) {
      return;
    }

    let type = agent.getType();
    if (isBlueprint(agent)) {
      type = agent.getPlaceable().entityType;
    }

    const cost = TOWER_PRICES[type] ?? 0;

    if (cost > this.money) {
      throw new Error("Not enough money!");
    }

    this.money -= cost;
    this.recentlyBought.add(agent);
  }

  replaceBlueprint(blueprint: Blueprint, actualAgent: Agent) {
    if (this.recentlyBought.has(blueprint)) {
      this.recentlyBought.delete(blueprint);
      this.recentlyBought.add(actualAgent);
    }
  }

  sell(agent: Agent) {
    if (Manager.Instance.getDifficulty() === Difficulty.Practice) {
      return;
    }

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
    const sellMultiplier = Math.min(
      0.9,
      MoneyController.sellMultiplier *
        Manager.Instance.getBase().getMoneyFactor()
    );

    const price = TOWER_PRICES[agent.getType()] ?? 0;
    return Math.ceil(
      price * (this.recentlyBought.has(agent) ? 1 : sellMultiplier)
    );
  }

  serialize(): MoneyControllerData {
    return {
      money: this.money,
    };
  }

  static get Instance() {
    return this.instance;
  }

  static deserialize(multiplier: () => number, data: MoneyControllerData) {
    const moneyController = new MoneyController(
      data.money === null ? Number.POSITIVE_INFINITY : data.money,
      multiplier
    );

    return moneyController;
  }
}

export default MoneyController;
