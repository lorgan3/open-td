import { Difficulty } from "../difficulty";
import { EntityType } from "../entity/entity";
import Manager from "../manager";
import SpawnGroup from "../wave/SpawnGroup";

class SpawnAlert {
  private constructor(
    private min: number,
    private max: number,
    private unit?: EntityType
  ) {}

  getRange() {
    return [this.min, this.max];
  }

  getCenter() {
    return (this.min + this.max) / 2;
  }

  getLength() {
    return this.max - this.min;
  }

  getUnit() {
    return this.unit;
  }

  equals(other: SpawnAlert) {
    return this.min === other.min && this.max === other.max;
  }

  toString() {
    return `[${this.min}, ${this.max}]`;
  }

  static forSpawnGroup(spawnGroup: SpawnGroup) {
    const [x, y] = spawnGroup.getCenter();
    const baseTile = Manager.Instance.getBase().getTile();
    const xDiff = x - baseTile.getX();
    const yDiff = y - baseTile.getY();

    const direction = ((Math.atan2(yDiff, xDiff) * 180) / Math.PI + 360) % 360;

    switch (Manager.Instance.getDifficulty()) {
      case Difficulty.Easy:
        return new SpawnAlert(
          Math.floor(direction / 15) * 15,
          Math.floor(direction / 15) * 15 + 15,
          spawnGroup.getUnitType()
        );
      case Difficulty.Normal:
        return new SpawnAlert(
          Math.floor(direction / 45) * 45,
          Math.floor(direction / 45) * 45 + 45
        );

      case Difficulty.Hard:
        return new SpawnAlert(
          Math.floor(direction / 120) * 120,
          Math.floor(direction / 120) * 120 + 120
        );
    }
  }

  static forSpawnGroups(spawnGroups: SpawnGroup[]) {
    const spawnAlerts = new Map<string, SpawnAlert>();
    spawnGroups
      .filter((spawnGroup) => !spawnGroup.isExposed())
      .forEach((spawnGroup) => {
        const alert = SpawnAlert.forSpawnGroup(spawnGroup);
        spawnAlerts.set(alert.toString(), alert);
      });

    return [...spawnAlerts.values()];
  }
}

export default SpawnAlert;
