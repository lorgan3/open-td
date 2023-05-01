import { MessageFn } from "../../renderers/api";
import { Save } from "../../util/localStorage/save";
import { Difficulty } from "../difficulty";
import Base from "../entity/base";
import EventSystem from "../eventSystem";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import AchievementController from "./achievementController";
import BuildController from "./buildController";
import DefaultManager from "./defaultManager";
import MoneyController from "./moneyController";
import PowerController from "./powerController";
import UnlocksController from "./unlocksController";
import VisibilityController from "./visibilityController";
import WaveController from "./waveController";
import { version } from "../../../package.json";

export const init = (
  difficulty: Difficulty,
  basePoint: Tile,
  surface: Surface,
  messageFn: MessageFn
) => {
  new EventSystem();
  new AchievementController();

  new VisibilityController(surface);

  const base = new Base(basePoint);
  const manager = new DefaultManager(difficulty, base, surface, messageFn);

  new WaveController(base, surface);
  new PowerController();
  new MoneyController(100, () => base.getMoneyFactor());
  new BuildController(surface);
  new UnlocksController();

  return manager;
};

export const serialize = (): Save => {
  return {
    version,
    manager: (DefaultManager.Instance as DefaultManager).serialize(),
    visibilityController: VisibilityController.Instance.serialize(),
    waveController: WaveController.Instance.serialize(),
    powerController: PowerController.Instance.serialize(),
    moneyController: MoneyController.Instance.serialize(),
    buildController: BuildController.Instance.serialize(),
    unlocksController: UnlocksController.Instance.serialize(),
  };
};

export const deserialize = (messageFn: MessageFn, data: Save) => {
  if (!EventSystem.Instance) {
    new EventSystem();
  }

  if (!AchievementController.Instance) {
    new AchievementController();
  }

  const manager = DefaultManager.deserialize(messageFn, data.manager);
  const surface = manager.getSurface();
  const base = manager.getBase();

  VisibilityController.deserialize(surface, data.visibilityController);
  WaveController.deserialize(surface, base, data.waveController);

  PowerController.deserialize(surface, data.powerController);
  MoneyController.deserialize(
    () => base.getMoneyFactor(),
    data.moneyController
  );
  BuildController.deserialize(surface, data.buildController);
  UnlocksController.deserialize(data.unlocksController);

  // Recompute visibility for all tiles.
  VisibilityController.Instance.commit();

  const playerBuildings = surface.getEntitiesForCategory(AgentCategory.Player);
  for (const building of playerBuildings) {
    const agent = building.getAgent();
    if (isTower(agent)) {
      // Recompute tower sight lines.
      agent.spawn!();
      continue;
    }

    if (BuildController.baseParts.has(agent.getType())) {
      // Reconstruct the base.
      base.addPart(agent as StaticAgent);
    }
  }

  manager.triggerStatUpdate();

  return manager;
};
