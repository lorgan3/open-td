import { EntityType } from "./entity/entity";
import { Group, SECTIONS } from "./placeables";

class UnlocksController {
  private unlockedTowers: Set<EntityType>;
  private availableUnlocks: Set<EntityType>;
  private unlockLinkedMap: Map<EntityType, EntityType>;

  private points = 0;

  constructor() {
    this.unlockedTowers = new Set();
    this.availableUnlocks = new Set();
    this.unlockLinkedMap = new Map();

    Object.values(Group).forEach((group) => {
      const towers = SECTIONS[group];

      towers.forEach((tower, index) => {
        if (index === 0) {
          this.unlockedTowers.add(tower.entityType);
          return;
        }

        if (index === 1) {
          this.availableUnlocks.add(tower.entityType);
        }

        if (towers.length > index + 1) {
          this.unlockLinkedMap.set(
            tower.entityType,
            towers[index + 1].entityType
          );
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

  canUnlock(type: EntityType) {
    return this.availableUnlocks.has(type) && this.points > 0;
  }

  isUnlocked(type: EntityType) {
    return this.unlockedTowers.has(type);
  }

  unlock(type: EntityType) {
    if (!this.canUnlock(type)) {
      throw new Error(`Can't unlock ${type}`);
    }

    this.points--;
    this.unlockedTowers.add(type);
    this.availableUnlocks.delete(type);
    const nextUnlock = this.unlockLinkedMap.get(type);
    if (nextUnlock) {
      this.availableUnlocks.add(type);
    }
  }
}

export default UnlocksController;
