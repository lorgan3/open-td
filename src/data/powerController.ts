import { Agent, EntityType } from "./entity/entity";
import { isTower } from "./entity/towers";
import { GameEvent } from "./events";
import Manager from "./manager";

export const POWER_CONSUMPTIONS: Partial<Record<EntityType, number>> = {
  [EntityType.ElectricFence]: 1,
  [EntityType.Railgun]: 5,
  [EntityType.Laser]: 3,
};

class PowerController {
  private generators = new Set<Agent>();
  private consumers = new Set<Agent>();

  private consumption = 0;

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
    this.consumption += consumption;
    this.consumers.add(agent);
  }

  removeConsumer(agent: Agent) {
    // No refunds!
    this.consumers.delete(agent);
    this.consumption -= this.getPowerConsumption(agent);
  }

  getProduction() {
    return Manager.Instance.getBase().getPartsCount(EntityType.PowerPlant) * 5;
  }

  getConsumption() {
    return this.consumption;
  }

  processPower() {
    this.power = this.power + this.getProduction() - this.getConsumption();

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

  private getPowerConsumption(agent: Agent): number {
    if (agent.getType() in POWER_CONSUMPTIONS) {
      return POWER_CONSUMPTIONS[agent.getType()]!;
    }

    throw new Error("Entity is not a consumer");
  }
}

export default PowerController;
