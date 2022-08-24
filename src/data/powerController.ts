import { Agent, EntityType } from "./entity/entity";

export const RECURRING_POWER_CONSUMPTIONS: Partial<Record<EntityType, number>> =
  {
    [EntityType.ElectricFence]: 0.2,
  };

export const POWER_CONSUMPTIONS: Partial<Record<EntityType, number>> = {
  [EntityType.ElectricFence]: 0,
  [EntityType.Railgun]: 1,
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
      (consumer) => (sum += this.getRecurringPowerConsumption(consumer))
    );

    return sum;
  }

  getLastConsumption() {
    return this.lastConsumption;
  }

  processPower() {
    this.lastProduction = this.getProduction();
    this.power += this.lastProduction;

    this.lastConsumption = this.getConsumption();
    this.power -= this.lastConsumption;
  }

  getPower() {
    return this.power;
  }

  private getPowerProduction(agent: Agent): number {
    switch (agent.getType()) {
      case EntityType.PowerPlant:
        return 1;
      default:
        throw new Error("Entity is not a generator");
    }
  }

  private getPowerConsumption(agent: Agent): number {
    if (agent.getType() in POWER_CONSUMPTIONS) {
      return POWER_CONSUMPTIONS[agent.getType()]!;
    }

    throw new Error("Entity is not a consumer");
  }

  private getRecurringPowerConsumption(agent: Agent): number {
    if (agent.getType() in RECURRING_POWER_CONSUMPTIONS) {
      return RECURRING_POWER_CONSUMPTIONS[agent.getType()]!;
    }

    return 0;
  }
}

export default PowerController;
