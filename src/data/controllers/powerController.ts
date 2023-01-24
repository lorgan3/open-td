import { EntityType } from "../entity/constants";
import { Agent } from "../entity/entity";
import { GameEvent } from "../events";
import EventSystem from "../eventSystem";
import Manager from "./manager";

export const POWER_CONSUMPTIONS: Partial<Record<EntityType, number>> = {
  [EntityType.ElectricFence]: 0.05,
  [EntityType.Laser]: 0.003,
  [EntityType.Railgun]: 5,
  [EntityType.Tesla]: 4,
  [EntityType.Mortar]: 2,
};

export const SPEED_BEACON_CONSUMPTION = 2;

export const DAMAGE_BEACON_CONSUMPTION = 1.25;

class PowerController {
  public static speedBeaconConsumption = 2;
  public static damageBeaconConsumption = 1.25;

  private static instance: PowerController;
  private static powerMultiplier = 5;

  private generators = new Set<Agent>();

  private consumption = 0;
  private blackout = false;

  private power = 0;

  constructor() {
    PowerController.instance = this;
  }

  registerGenerator(agent: Agent) {
    this.generators.add(agent);
  }

  removeGenerator(agent: Agent) {
    this.generators.delete(agent);
  }

  getProduction() {
    return (
      Manager.Instance.getBase().getPartsCount(EntityType.PowerPlant) *
      PowerController.powerMultiplier
    );
  }

  getConsumption() {
    return this.consumption;
  }

  consume(power: number) {
    if (power === 0) {
      return true;
    }

    if (this.blackout) {
      return false;
    }

    this.power -= power;

    if (this.power < 0) {
      this.power = 0;
      this.blackout = true;
      EventSystem.Instance.triggerEvent(GameEvent.BlackOut);
      Manager.Instance.triggerStatUpdate();

      return false;
    }

    this.consumption += power;
    return true;
  }

  processPower() {
    this.power = this.power + this.getProduction();
    this.blackout = false;

    if (this.power < 0) {
      EventSystem.Instance.triggerEvent(GameEvent.BlackOut);
    }

    if (!Manager.Instance.getIsStarted()) {
      this.consumption = 0;
    }
  }

  emergencyRegenerate(multiplier = 1) {
    this.power =
      this.power +
      Manager.Instance.getBase().getParts().size *
        PowerController.powerMultiplier *
        multiplier;
    this.blackout = false;
  }

  getPower() {
    return this.power;
  }

  static get Instance() {
    return this.instance;
  }
}

export default PowerController;
