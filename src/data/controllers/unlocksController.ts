import { GameEvent } from "../events";
import { Group, Placeable, SECTIONS } from "../placeables";
import { EntityType } from "../entity/constants";
import EventSystem from "../eventSystem";

export interface UnlocksControllerData {
  points: number;
  unlockedAmount: number;
  unlockedTowers: EntityType[];
  availableUnlocks: EntityType[];
}

class UnlocksController {
  private static instance: UnlocksController;

  private unlockedTowers: Set<EntityType>;
  private availableUnlocks: Set<EntityType>;
  private unlockLinkedMap: Map<EntityType, Placeable>;

  private points = 0;
  private unlockedAmount = 0;

  constructor() {
    UnlocksController.instance = this;

    this.unlockedTowers = new Set();
    this.availableUnlocks = new Set();
    this.unlockLinkedMap = new Map();

    Object.values(Group).forEach((group) => {
      const towers = SECTIONS[group];

      towers.forEach((tower, index) => {
        if (index === 0) {
          this.unlockedTowers.add(tower.entityType);

          if (tower.isRepeatable) {
            this.availableUnlocks.add(tower.entityType);
          }
          return;
        }

        if (this.unlockedTowers.has(towers[index - 1].entityType)) {
          this.availableUnlocks.add(tower.entityType);

          if (tower.isRepeatable) {
            this.unlockedTowers.add(tower.entityType);
          }
        }

        if (towers.length > index + 1) {
          this.unlockLinkedMap.set(tower.entityType, towers[index + 1]);
        }
      });
    });
  }

  addPoints(points = 1) {
    this.points += points;
  }

  getPoints() {
    return this.points;
  }

  canUnlock(placeable: Placeable) {
    return (
      this.availableUnlocks.has(placeable.entityType) &&
      this.points >= (placeable.cost ?? 1)
    );
  }

  isUnlocked(placeable: Placeable) {
    return this.unlockedTowers.has(placeable.entityType);
  }

  getUnlockAmount() {
    return this.unlockedAmount;
  }

  unlock(placeable: Placeable) {
    if (!this.canUnlock(placeable)) {
      throw new Error(`Can't unlock ${placeable.entityType}`);
    }

    this.points -= placeable.cost ?? 1;
    this.makeAvailable(placeable);

    EventSystem.Instance.triggerEvent(GameEvent.Unlock, { placeable });
  }

  serialize(): UnlocksControllerData {
    return {
      points: this.points,
      unlockedAmount: this.unlockedAmount,
      unlockedTowers: [...this.unlockedTowers],
      availableUnlocks: [...this.availableUnlocks],
    };
  }

  private makeAvailable(placeable: Placeable) {
    if (!placeable.isRepeatable) {
      this.unlockedTowers.add(placeable.entityType);
      this.availableUnlocks.delete(placeable.entityType);
      this.unlockedAmount++;
    }

    const nextUnlock = this.unlockLinkedMap.get(placeable.entityType);
    if (nextUnlock) {
      this.availableUnlocks.add(nextUnlock.entityType);

      if (nextUnlock.isRepeatable) {
        this.makeAvailable(nextUnlock);
      }
    }
  }

  static get Instance() {
    return this.instance;
  }

  static deserialize(data: UnlocksControllerData) {
    const unlocksController = new UnlocksController();
    unlocksController.points = data.points;
    unlocksController.unlockedAmount = data.unlockedAmount;
    unlocksController.availableUnlocks = new Set(data.availableUnlocks);
    unlocksController.unlockedTowers = new Set(data.unlockedTowers);
  }
}

export default UnlocksController;
