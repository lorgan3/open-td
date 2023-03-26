import Manager from "../data/controllers/manager";
import { IEnemyStatics } from "../data/entity/enemies";
import Behemoth from "../data/entity/enemies/behemoth";
import Bore from "../data/entity/enemies/bore";
import Flier from "../data/entity/enemies/flier";
import Regular from "../data/entity/enemies/regular";
import Runner from "../data/entity/enemies/runner";
import Tank from "../data/entity/enemies/tank";
import Flamethrower from "../data/entity/towers/flamethrower";
import Laser from "../data/entity/towers/laser";
import Mortar from "../data/entity/towers/mortar";
import Railgun from "../data/entity/towers/railgun";
import Tesla from "../data/entity/towers/tesla";
import Tower from "../data/entity/towers/tower";
import Pathfinder from "../data/terrain/path/pathfinder";

type Trigger = [() => void, number];

class Timeline {
  private currentTrigger!: Trigger;
  constructor(public events: Trigger[]) {}

  play() {
    if (this.events.length === 0) {
      return;
    }

    this.currentTrigger = this.events.shift()!;
    window.setTimeout(() => {
      this.currentTrigger[0]();
      this.play();
    }, this.currentTrigger[1]);
  }
}
type Coord = [number, number];

const spawnEnemy = (coords: Coord[], Unit: IEnemyStatics) => {
  const surface = Manager.Instance.getSurface();
  const pathfinder = new Pathfinder(
    surface,
    Unit.pathMultipliers,
    Unit.pathCosts,
    Unit.scale
  );

  const path = pathfinder.getWaypointPath(
    coords.map((coords) => surface.getTile(...coords)!)
  )!;

  const unit = new Unit(path.getTile(), path);
  unit.initializePath();

  Manager.Instance.spawnEnemy(unit);
};

export default new Timeline([
  // Seed: s
  [
    () => {
      Manager.Instance.getSurface().spawnStatic(
        new Tower(Manager.Instance.getSurface().getTile(5, 5)!)
      );

      spawnEnemy(
        [
          [20, 5],
          [8, 5],
        ],
        Runner
      );
    },
    100,
  ],
  [
    () => {
      Manager.Instance.getSurface().despawnStatic(
        Manager.Instance.getSurface()
          .getTile(5, 5)!
          .getStaticEntity()!
          .getAgent()
      );

      spawnEnemy(
        [
          [7, 0],
          [7, 8],
          [13, 8],
          [13, 3],
          [7, 3],
          [7, 8],
          [13, 8],
          [13, 3],
        ],
        Runner
      );
      spawnEnemy(
        [
          [13, 13],
          [13, 3],
          [7, 3],
          [7, 8],
          [13, 8],
          [13, 3],
          [7, 3],
          [7, 8],
        ],
        Runner
      );
    },
    2500,
  ],
  [
    () => {
      Manager.Instance.getSurface().spawnStatic(
        new Flamethrower(Manager.Instance.getSurface().getTile(9, 5)!)
      );
    },
    500,
  ],
  [
    () => {
      Manager.Instance.getSurface().despawnStatic(
        Manager.Instance.getSurface()
          .getTile(9, 5)!
          .getStaticEntity()!
          .getAgent()
      );
    },
    2000,
  ],
  [
    () => {
      Manager.Instance.getSurface().spawnStatic(
        new Laser(Manager.Instance.getSurface().getTile(5, 5)!)
      );

      spawnEnemy(
        [
          [20, 5],
          [8, 5],
        ],
        Runner
      );

      spawnEnemy(
        [
          [22, 6],
          [8, 6],
        ],
        Runner
      );
    },
    500,
  ],
  [
    () => {
      Manager.Instance.getSurface().despawnStatic(
        Manager.Instance.getSurface()
          .getTile(5, 5)!
          .getStaticEntity()!
          .getAgent()
      );
    },
    3000,
  ],
  [
    () => {
      Manager.Instance.getSurface().spawnStatic(
        new Tesla(Manager.Instance.getSurface().getTile(9, 5)!)
      );

      spawnEnemy(
        [
          [7, 0],
          [7, 8],
          [13, 8],
          [13, 3],
          [7, 3],
          [7, 8],
          [13, 8],
          [13, 3],
          [7, 3],
        ],
        Runner
      );
      spawnEnemy(
        [
          [4, 8],
          [13, 8],
          [13, 3],
          [7, 3],
          [7, 8],
          [13, 8],
          [13, 3],
          [7, 3],
          [7, 8],
        ],
        Runner
      );
      spawnEnemy(
        [
          [13, 11],
          [13, 3],
          [7, 3],
          [7, 8],
          [13, 8],
          [13, 3],
          [7, 3],
          [7, 8],
          [13, 8],
        ],
        Runner
      );

      spawnEnemy(
        [
          [16, 3],
          [7, 3],
          [7, 8],
          [13, 8],
          [13, 3],
          [7, 3],
          [7, 8],
          [13, 8],
          [13, 3],
        ],
        Runner
      );
    },
    500,
  ],
  [
    () => {
      Manager.Instance.getSurface().despawnStatic(
        Manager.Instance.getSurface()
          .getTile(9, 5)!
          .getStaticEntity()!
          .getAgent()
      );
    },
    3000,
  ],
  [
    () => {
      Manager.Instance.getSurface().spawnStatic(
        new Mortar(Manager.Instance.getSurface().getTile(5, 5)!)
      );

      spawnEnemy(
        [
          [20, 5],
          [15, 5],
        ],
        Runner
      );
      spawnEnemy(
        [
          [19, 5],
          [14, 5],
        ],
        Runner
      );
      spawnEnemy(
        [
          [20, 4],
          [15, 4],
        ],
        Runner
      );
      spawnEnemy(
        [
          [20, 6],
          [15, 6],
        ],
        Runner
      );
      spawnEnemy(
        [
          [21, 5],
          [16, 5],
        ],
        Runner
      );
    },
    500,
  ],
  [
    () => {
      Manager.Instance.getSurface().despawnStatic(
        Manager.Instance.getSurface()
          .getTile(5, 5)!
          .getStaticEntity()!
          .getAgent()
      );
    },
    3000,
  ],
  [
    () => {
      Manager.Instance.getSurface().spawnStatic(
        new Railgun(Manager.Instance.getSurface().getTile(5, 5)!)
      );

      spawnEnemy(
        [
          [16, 0],
          [16, 12],
        ],
        Runner
      );
      spawnEnemy(
        [
          [15, 12],
          [15, 0],
        ],
        Runner
      );
      spawnEnemy(
        [
          [14, 0],
          [14, 12],
        ],
        Runner
      );
      spawnEnemy(
        [
          [13, 12],
          [13, 0],
        ],
        Runner
      );
      spawnEnemy(
        [
          [12, 0],
          [12, 12],
        ],
        Runner
      );
      spawnEnemy(
        [
          [11, 12],
          [11, 0],
        ],
        Runner
      );
    },
    500,
  ],
  // Seed: wet
  /*[
    () =>
      spawnEnemy(
        [
          [10, 22],
          [10, 26],
          [40, 49],
          [15, 49],
          [40, 49],
          [30, 30],
          [0, 30],
        ],
        Runner
      ),
    100,
  ],
  [
    () =>
      spawnEnemy(
        [
          [10, 22],
          [10, 26],
          [30, 31],
          [0, 31],
        ],
        Regular
      ),
    1000,
  ],
  [
    () =>
      spawnEnemy(
        [
          [10, 22],
          [10, 26],
          [30, 31],
          [0, 31],
        ],
        Tank
      ),
    8000,
  ],
  [
    () =>
      spawnEnemy(
        [
          [10, 22],
          [10, 26],
          [30, 30],
          [0, 30],
        ],
        Flier
      ),
    3000,
  ],
  [
    () =>
      spawnEnemy(
        [
          [6, 22],
          [6, 26],
          [44, 41],
        ],
        Behemoth
      ),
    4000,
  ],
  [
    () =>
      spawnEnemy(
        [
          [12, 22],
          [12, 26],
          [46, 41],
        ],
        Bore
      ),
    3000,
  ],*/
]);
