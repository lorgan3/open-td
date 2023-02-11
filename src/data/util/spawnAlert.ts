import { Difficulty } from "../difficulty";
import Manager from "../controllers/manager";
import SpawnGroup from "../wave/spawnGroup";
import { EntityType } from "../entity/constants";

class SpawnAlert {
  private constructor(
    private min: number,
    private max: number,
    private units: EntityType[] = []
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

  getUnits() {
    return this.units;
  }

  addUnit(unit: EntityType) {
    if (!this.units.includes(unit)) {
      this.units.push(unit);
    }

    this.units.sort((a, b) => b - a);
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
          [spawnGroup.getUnitType()]
        );
      case Difficulty.Normal:
        return new SpawnAlert(
          Math.floor(direction / 45) * 45,
          Math.floor(direction / 45) * 45 + 45,
          [spawnGroup.getUnitType()]
        );

      case Difficulty.Hard:
        return new SpawnAlert(
          Math.floor(direction / 120) * 120,
          Math.floor(direction / 120) * 120 + 120,
          [spawnGroup.getUnitType()]
        );
    }
  }

  static forSpawnGroups(spawnGroups: SpawnGroup[]) {
    const spawnAlerts = new Map<string, SpawnAlert>();
    spawnGroups
      .filter((spawnGroup) => !spawnGroup.isExposed())
      .forEach((spawnGroup) => {
        const alert = SpawnAlert.forSpawnGroup(spawnGroup);

        const original = spawnAlerts.get(alert.toString());
        if (original) {
          original.addUnit(spawnGroup.getUnitType());
        } else {
          spawnAlerts.set(alert.toString(), alert);
        }
      });

    return [...spawnAlerts.values()];
  }
}

export default SpawnAlert;
