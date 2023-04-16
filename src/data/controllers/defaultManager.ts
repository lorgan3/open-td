import { MessageFn } from "../../renderers/api";
import BuildController from "./buildController";
import { Difficulty } from "../difficulty";
import { IEnemy, isEnemy } from "../entity/enemies";
import { Agent } from "../entity/entity";
import { Discover, DiscoveryMethod, GameEvent, Unlock } from "../events";
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
import WavePoint from "../entity/wavePoint";
import { SurfaceSchema } from "../terrain/surfaceSchema";
export interface DefaultManagerData {
  killedEnemies: number;
  difficulty: Difficulty;
  base: { x: number; y: number; hp: number };
  level: number;
  surface: string;
}

class DefaultManager extends Manager {
  private static serializeStartChar = "À".charCodeAt(0);

  private killedEnemies = 0;
  private lastKilledEnemies = 0;

  private removeUnlockEventListener: () => void;
  private removeDiscoverEventListener: () => void;
  private removeLostEventListener: () => void;

  constructor(
    difficulty: Difficulty,
    base: Base | null,
    surface: Surface,
    messageFn: MessageFn
  ) {
    super(difficulty, base!, surface, messageFn);

    if (base) {
      this.surface.getEntityTiles(this.base).map((tile) => {
        if (tile.hasStaticEntity()) {
          this.surface.despawnStatic(tile.getStaticEntity().getAgent());
        }
      });

      surface.spawnStatic(this.base);
    }

    this.removeUnlockEventListener = EventSystem.Instance.addEventListener(
      GameEvent.Unlock,
      this.onUnlock
    );
    this.removeDiscoverEventListener = EventSystem.Instance.addEventListener(
      GameEvent.Discover,
      this.onDiscover
    );
    this.removeLostEventListener = EventSystem.Instance.addEventListener(
      GameEvent.Lose,
      () => window.setTimeout(this.onLose, 0)
    );

    console.log(this);
  }

  cleanup() {
    this.removeUnlockEventListener();
    this.removeDiscoverEventListener();
    this.removeLostEventListener();
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

    if (this.lastKilledEnemies !== this.killedEnemies) {
      this.lastKilledEnemies = this.killedEnemies;
      EventSystem.Instance.triggerEvent(GameEvent.Kill);
    }
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
  }

  despawnEnemy(enemy: IEnemy) {
    this.killedEnemies++;

    if (this.surface.despawn(enemy)) {
      if (WaveController.Instance.processWave()) {
        this.end();
      }
    }
  }

  getKilledEnemies(): number {
    return this.killedEnemies;
  }

  getIsStarted() {
    return (
      WaveController.Instance.isWaveInProgress() ||
      WaveController.Instance.getSpawnGroups().length === 0
    );
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

  serialize(): DefaultManagerData {
    const baseTile = this.base.getTile();
    const schema = this.surface.serialize(true);

    return {
      killedEnemies: this.killedEnemies,
      difficulty: this.difficulty,
      base: { x: baseTile.getX(), y: baseTile.getY(), hp: this.base.getHp() },
      level: this.level,
      surface: [...schema.buffer]
        .map((value) =>
          String.fromCharCode(value + DefaultManager.serializeStartChar)
        )
        .join(""),
    };
  }

  private end() {
    BuildController.Instance.commit();
    VisibilityController.Instance.commit();
    WaveController.Instance.cleanupSpawnGroups(DiscoveryMethod.Base);
    this.base.regenerate();

    this.triggerStatUpdate();
    EventSystem.Instance.triggerEvent(GameEvent.EndWave);

    if (WaveController.Instance.getSpawnGroups().length === 0) {
      this.showMessage("World conquered. You win!", {
        closable: false,
        expires: 0,
      });
    } else if (this.level === 9) {
      this.showMessage("Something is rumbling in the distance.");
    } else if (WaveController.Instance.shouldAddSpawnGroup()) {
      EventSystem.Instance.triggerEvent(GameEvent.Spawn);
      this.showMessage("Another spawn point has appeared!");
    }

    // Spawn group paths might have changed
    Manager.Instance.getSurface().forceRerender();
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
        (Base.baseEmergencyRepair + this.base.getParts().size) *
        (inProgress ? 1 : WAVE_OVER_MULTIPLIER);

      this.triggerStatUpdate();
    }
  };

  private onDiscover = (event: Discover) => {
    const amount = event.method === DiscoveryMethod.Base ? 2 : 1;
    UnlocksController.Instance.addPoints(amount);

    const wavePoint = new WavePoint(
      this.surface.getTile(event.x, event.y)!,
      amount
    );
    this.surface.spawn(wavePoint);
    wavePoint.discover();
  };

  private onLose = () => {
    this.surface
      .getEntitiesForCategory(AgentCategory.Enemy)
      .forEach((entity) => {
        const agent = entity.getAgent();

        if (isEnemy(agent)) {
          agent.AI.cancel();
        }
      });
  };

  static deserialize(messageFn: MessageFn, data: DefaultManagerData) {
    const schema = new SurfaceSchema(
      Uint8Array.from(
        data.surface
          .split("")
          .map((char) => char.charCodeAt(0) - DefaultManager.serializeStartChar)
      )
    );
    const surface = new Surface(schema);
    const manager = new DefaultManager(
      data.difficulty,
      null,
      surface,
      messageFn
    );
    manager.level = data.level;

    manager.base = surface
      .getTile(data.base.x, data.base.y)!
      .getStaticEntity()!
      .getAgent() as Base;
    manager.base.hp = data.base.hp;

    return manager;
  }
}

export default DefaultManager;
