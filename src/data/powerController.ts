import { Agent, EntityType } from "./entity/entity";

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
    this.consumers.add(agent);
  }

  removeConsumer(agent: Agent) {
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
    switch (agent.getType()) {
      default:
        throw new Error("Entity is not a consumer");
    }
  }
}

export default PowerController;
