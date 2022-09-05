import { Agent, EntityType } from "./entity/entity";
import { GameEvent } from "./events";
import Manager from "./manager";

export const POWER_CONSUMPTIONS: Partial<Record<EntityType, number>> = {
  [EntityType.ElectricFence]: 1,
  [EntityType.Railgun]: 5,
  [EntityType.Laser]: 0.03,
};

class PowerController {
  private generators = new Set<Agent>();

  private consumption = 0;
  private blackout = false;

  private power = 0;

  registerGenerator(agent: Agent) {
    this.generators.add(agent);
  }

  removeGenerator(agent: Agent) {
    this.generators.delete(agent);
  }

  getProduction() {
    return Manager.Instance.getBase().getPartsCount(EntityType.PowerPlant) * 5;
  }

  getConsumption() {
    return this.consumption;
  }

  consume(power: number) {
    if (this.blackout) {
      return false;
    }

    this.power -= power;

    if (this.power < 0) {
      this.power = 0;
      this.blackout = true;
      Manager.Instance.triggerEvent(GameEvent.BlackOut);

      return false;
    }

    this.consumption += power;
    return true;
  }

  processPower() {
    this.power = this.power + this.getProduction();
    this.consumption = 0;
    this.blackout = false;

    if (this.power < 0) {
      Manager.Instance.triggerEvent(GameEvent.BlackOut);
    }
  }

  getPower() {
    return this.power;
  }
}

export default PowerController;
