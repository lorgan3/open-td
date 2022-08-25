import { Agent, EntityType } from "./entity/entity";
import { isTower } from "./entity/towers";
import { GameEvent } from "./events";
import Manager from "./manager";

export const POWER_PRODUCTIONS: Partial<Record<EntityType, number>> = {
  [EntityType.PowerPlant]: 5,
};

export const POWER_CONSUMPTIONS: Partial<Record<EntityType, number>> = {
  [EntityType.ElectricFence]: 1,
  [EntityType.Railgun]: 5,
};

class PowerController {
  private generators = new Set<Agent>();
  private consumers = new Set<Agent>();

  private lastProduction = 0;
  private lastConsumption = 0;

  private power = 0;

  registerGenerator(agent: Agent) {
    this.generators.add(agent);
  }

  removeGenerator(agent: Agent) {
    this.generators.delete(agent);
  }

  registerConsumer(agent: Agent) {
    const consumption = this.getPowerConsumption(agent);
    if (consumption > this.power) {
      throw new Error("Not enough power!");
    }

    this.power -= consumption;
    this.consumers.add(agent);
  }

  removeConsumer(agent: Agent) {
    // No refunds!
    this.consumers.delete(agent);
  }

  getProduction() {
    let sum = 0;
    this.generators.forEach(
      (generator) => (sum += this.getPowerProduction(generator))
    );

    return sum;
  }

  getLastProduction() {
    return this.lastProduction;
  }

  getConsumption() {
    let sum = 0;
    this.consumers.forEach(
      (consumer) => (sum += this.getPowerConsumption(consumer))
    );

    return sum;
  }

  getLastConsumption() {
    return this.lastConsumption;
  }

  processPower() {
    this.lastProduction = this.getProduction();
    this.lastConsumption = this.getConsumption();

    this.power = this.power + this.lastProduction - this.lastConsumption;

    let fn: "enable" | "disable" = "enable";
    if (this.power < 0) {
      this.power = 0;
      fn = "disable";

      Manager.Instance.triggerEvent(GameEvent.BlackOut, {
        affectedConsumers: [...this.consumers],
      });
    }

    this.consumers.forEach((consumer) => {
      if (isTower(consumer)) {
        consumer[fn]();
      }
    });
  }

  getPower() {
    return this.power;
  }

  private getPowerProduction(agent: Agent): number {
    if (agent.getType() in POWER_PRODUCTIONS) {
      return POWER_PRODUCTIONS[agent.getType()]!;
    }

    throw new Error("Entity is not a generator");
  }

  private getPowerConsumption(agent: Agent): number {
    if (agent.getType() in POWER_CONSUMPTIONS) {
      return POWER_CONSUMPTIONS[agent.getType()]!;
    }

    throw new Error("Entity is not a consumer");
  }
}

export default PowerController;
