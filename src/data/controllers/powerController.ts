import { EntityType } from "../entity/constants";
import { StaticAgent } from "../entity/staticEntity";
import { GameEvent } from "../events";
import EventSystem from "../eventSystem";
import Surface from "../terrain/surface";
import Manager from "./manager";

export const POWER_CONSUMPTIONS: Partial<Record<EntityType, number>> = {
  [EntityType.ElectricFence]: 0.05,
  [EntityType.Laser]: 0.003,
  [EntityType.Railgun]: 5,
  [EntityType.Tesla]: 4,
  [EntityType.Mortar]: 2,
};

export interface PowerControllerData {
  power: number;
  consumption: number;
  generators: Array<{ x: number; y: number }>;
}

class PowerController {
  public static speedBeaconConsumption = 1.1;
  public static damageBeaconConsumption = 1.2;

  private static instance: PowerController;
  private static powerMultiplier = 5;
  public static baseEmergencyRegenerate = 30;
  public static emergencyRegenerateMultiplier = 2;

  private generators = new Set<StaticAgent>();

  private consumption = 0;
  private blackout = false;

  private power = 0;

  constructor() {
    PowerController.instance = this;
  }

  registerGenerator(agent: StaticAgent) {
    this.generators.add(agent);
  }

  removeGenerator(agent: StaticAgent) {
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
      (PowerController.baseEmergencyRegenerate +
        Manager.Instance.getBase().getParts().size *
          PowerController.emergencyRegenerateMultiplier) *
        multiplier;
    this.blackout = false;
  }

  getPower() {
    return this.power;
  }

  serialize(): PowerControllerData {
    return {
      power: this.power,
      consumption: this.consumption,
      generators: [...this.generators].map((agent) => {
        const tile = agent.getTile();
        return { x: tile.getX(), y: tile.getY() };
      }),
    };
  }

  static get Instance() {
    return this.instance;
  }

  static deserialize(surface: Surface, data: PowerControllerData) {
    const powerController = new PowerController();

    powerController.power = data.power;
    powerController.consumption = data.consumption;
    powerController.generators = new Set(
      data.generators.map(({ x, y }) =>
        surface.getTile(x, y)!.getStaticEntity()!.getAgent()
      )
    );
  }
}

export default PowerController;
