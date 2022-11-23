import { MessageFn } from "../../renderers/api";
import { Difficulty } from "../difficulty";
import Base from "../entity/base";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import BuildController from "./buildController";
import DefaultManager from "./defaultManager";
import MoneyController from "./moneyController";
import PowerController from "./powerController";
import UnlocksController from "./unlocksController";
import VisibilityController from "./visibilityController";
import WaveController from "./waveController";

export const init = (
  difficulty: Difficulty,
  basePoint: Tile,
  surface: Surface,
  messageFn: MessageFn
) => {
  const base = new Base(basePoint);
  const manager = new DefaultManager(difficulty, base, surface, messageFn);

  new VisibilityController(surface);
  const waveController = new WaveController(base, surface);
  new PowerController();
  new MoneyController(150, () =>
    Math.max(0.5, base.getMoneyFactor() - waveController.getLevel() / 120)
  );
  new BuildController(surface);
  new UnlocksController();

  return manager;
};
