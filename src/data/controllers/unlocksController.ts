import { EntityType } from "../entity/entity";
import { GameEvent } from "../events";
import Manager from "./manager";
import { Group, Placeable, SECTIONS } from "../placeables";

class UnlocksController {
  private unlockedTowers: Set<EntityType>;
  private availableUnlocks: Set<EntityType>;
  private unlockLinkedMap: Map<EntityType, Placeable>;

  private points = 0;

  constructor() {
    this.unlockedTowers = new Set();
    this.availableUnlocks = new Set();
    this.unlockLinkedMap = new Map();

    Object.values(Group).forEach((group) => {
      const towers = SECTIONS[group];

      towers.forEach((tower, index) => {
        if (index === 0) {
          this.availableUnlocks.add(tower.entityType);
          this.unlockedTowers.add(tower.entityType);
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

  addPoint() {
    this.points++;
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

  unlock(placeable: Placeable) {
    if (!this.canUnlock(placeable)) {
      throw new Error(`Can't unlock ${placeable.entityType}`);
    }

    this.points -= placeable.cost ?? 1;
    this.makeAvailable(placeable);

    Manager.Instance.triggerEvent(GameEvent.Unlock, { placeable });
  }

  private makeAvailable(placeable: Placeable) {
    this.unlockedTowers.add(placeable.entityType);

    if (!placeable.isRepeatable) {
      this.availableUnlocks.delete(placeable.entityType);
    }

    const nextUnlock = this.unlockLinkedMap.get(placeable.entityType);
    if (nextUnlock) {
      this.availableUnlocks.add(nextUnlock.entityType);

      if (nextUnlock.isRepeatable) {
        this.makeAvailable(nextUnlock);
      }
    }
  }
}

export default UnlocksController;
