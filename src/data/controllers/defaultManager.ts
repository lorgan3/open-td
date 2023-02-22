import { MessageFn } from "../../renderers/api";
import BuildController from "./buildController";
import { Difficulty } from "../difficulty";
import { IEnemy } from "../entity/enemies";
import { Agent } from "../entity/entity";
import { GameEvent, Unlock } from "../events";
import MoneyController, { TOWER_PRICES } from "./moneyController";
import { Placeable, WAVE_OVER_MULTIPLIER } from "../placeables";
import PowerController, { POWER_CONSUMPTIONS } from "./powerController";
import Surface from "../terrain/surface";
import UnlocksController from "./unlocksController";
import Manager from "./manager";
import { AgentCategory, EntityType } from "../entity/constants";
import EventSystem from "../eventSystem";
import Base from "../entity/base";
import WaveController from "./waveController";
import VisibilityController from "./visibilityController";

class DefaultManager extends Manager {
  private killedEnemies = 0;

  constructor(
    difficulty: Difficulty,
    base: Base,
    surface: Surface,
    messageFn: MessageFn
  ) {
    super(difficulty, base, surface, messageFn);

    this.surface.getEntityTiles(this.base).map((tile) => {
      if (tile.hasStaticEntity()) {
        this.surface.despawnStatic(tile.getStaticEntity().getAgent());
      }
    });

    surface.spawnStatic(this.base);

    EventSystem.Instance.addEventListener(GameEvent.Unlock, this.onUnlock);
    EventSystem.Instance.addEventListener(GameEvent.Discover, this.onDiscover);

    console.log(this);
  }

  tick(dt: number) {
    this.surface.processChangedTiles();

    if (this.base.isDestroyed()) {
      return;
    }

    const entities = this.surface.getTickingEntities();
    for (let entity of entities) {
      entity.getAgent().tick!(dt);
    }

    WaveController.Instance.tick(dt);
  }

  triggerStatUpdate() {
    const remainingEnemies = this.getSurface().getEntitiesForCategory(
      AgentCategory.Enemy
    ).size;

    EventSystem.Instance.triggerEvent(GameEvent.StatUpdate, {
      integrity: this.base.getHp(),
      regeneration: this.base.getRegenerationFactor(),
      level: this.level,
      money: MoneyController.Instance.getMoney(),
      moneyMultiplier: MoneyController.Instance.getMultiplier(),
      production: PowerController.Instance.getProduction(),
      consumption: PowerController.Instance.getConsumption(),
      power: PowerController.Instance.getPower(),
      remainingEnemies,
      inProgress: this.getIsStarted(),
      towers: this.surface.getTowers().size,
      maxTowers: BuildController.Instance.getMaxTowers(),
    });
  }

  spawnEnemy(enemy: IEnemy) {
    this.surface.spawn(enemy);
    this.triggerStatUpdate();
  }

  despawnEnemy(enemy: IEnemy) {
    this.killedEnemies++;

    if (this.surface.despawn(enemy)) {
      if (WaveController.Instance.processWave()) {
        this.end();
      } else {
        this.triggerStatUpdate();
      }
    }
  }

  getKilledEnemies(): number {
    return this.killedEnemies;
  }

  getIsStarted() {
    return WaveController.Instance.isWaveInProgress();
  }

  canBuy(placeable: Placeable, amount = 1) {
    const cost = (TOWER_PRICES[placeable.entityType] ?? 0) * amount;
    if (cost > MoneyController.Instance.getMoney()) {
      this.showMessage(`You do not have enough money. This costs 🪙 ${cost}`);
      return false;
    }

    return true;
  }

  start() {
    if (this.getIsStarted()) {
      throw new Error("Wave already in progress!");
    }

    if (
      this.surface.getTowers().size > BuildController.Instance.getMaxTowers()
    ) {
      Manager.Instance.showMessage(
        `Your current base can support up to ${BuildController.Instance.getMaxTowers()} towers. Extend your base or sell towers before starting `
      );
      return;
    }

    PowerController.Instance.processPower();
    MoneyController.Instance.clearRecents();
    MoneyController.Instance.addWaveBudget(this.level);
    WaveController.Instance.startNewWave();

    // Activate newly placed radars
    VisibilityController.Instance.commit();

    // Increase level and show the new area that will be discovered.
    this.level++;
    VisibilityController.Instance.updateBaseRange();

    EventSystem.Instance.triggerEvent(GameEvent.StartWave);

    this.triggerStatUpdate();
    Manager.Instance.getSurface().forceRerender();
  }

  showMessage: MessageFn = (...args) => {
    return this.messageFn(...args);
  };

  consume(agent: Agent, speedMultiplier = 1, damageMultiplier = 1) {
    return PowerController.Instance.consume(
      (POWER_CONSUMPTIONS[agent.getType()] ?? 0) +
        (speedMultiplier - 1) * PowerController.speedBeaconConsumption +
        (damageMultiplier - 1) * PowerController.damageBeaconConsumption
    );
  }

  consumeContinuous(agent: Agent, dt: number, damageMultiplier = 1) {
    return PowerController.Instance.consume(
      (POWER_CONSUMPTIONS[agent.getType()] ?? 0) * dt +
        ((damageMultiplier - 1) *
          PowerController.damageBeaconConsumption *
          dt) /
          160
    );
  }

  getDifficulty() {
    return this.difficulty;
  }

  getIsBaseDestroyed() {
    return this.base.isDestroyed();
  }

  private end() {
    BuildController.Instance.commit();
    VisibilityController.Instance.commit();
    WaveController.Instance.cleanupSpawnGroups();
    this.base.regenerate();

    this.triggerStatUpdate();
    EventSystem.Instance.triggerEvent(GameEvent.EndWave);

    if (WaveController.Instance.shouldAddSpawnGroup()) {
      EventSystem.Instance.triggerEvent(GameEvent.Spawn);
      this.showMessage("Another spawn point has appeared!");
    }

    // Spawn group paths might have changed
    Manager.Instance.getSurface().forceRerender();
  }

  getDamageMultiplier() {
    let multiplier = 1;
    switch (this.difficulty) {
      case Difficulty.Hard:
        multiplier += 0.2;
      case Difficulty.Normal:
        multiplier += 0.2;
    }

    return multiplier;
  }

  private onUnlock = ({ placeable }: Unlock) => {
    const inProgress = this.getIsStarted();

    if (placeable.entityType === EntityType.EmergencyRecharge) {
      PowerController.Instance.emergencyRegenerate(
        inProgress ? 1 : WAVE_OVER_MULTIPLIER
      );

      this.triggerStatUpdate();
    }

    if (placeable.entityType === EntityType.EmergencyRepair) {
      this.base.hp +=
        2 * this.base.getParts().size * (inProgress ? 1 : WAVE_OVER_MULTIPLIER);

      this.triggerStatUpdate();
    }
  };

  private onDiscover = () => {
    UnlocksController.Instance.addPoint();
  };
}

export default DefaultManager;
