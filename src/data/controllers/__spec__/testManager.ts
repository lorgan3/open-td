import { MessageFn } from "../../../renderers/api";
import { Difficulty } from "../../difficulty";
import { IEnemy } from "../../entity/enemies";
import { Agent } from "../../entity/entity";
import { Placeable } from "../../placeables";
import Surface from "../../terrain/surface";
import Tile from "../../terrain/tile";
import Controller from "../controller";
import Manager from "../manager";

class TestManager extends Manager {
  constructor(
    difficulty: Difficulty,
    basePoint: Tile,
    surface: Surface,
    controller: Controller,
    messageFn: MessageFn
  ) {
    super(difficulty, basePoint, surface, controller, messageFn);
    surface.spawnStatic(this.base);
  }

  tick(dt: number): void {
    throw new Error("Method not implemented.");
  }

  triggerStatUpdate(): void {
    throw new Error("Method not implemented.");
  }

  spawnEnemy(enemy: IEnemy): void {
    throw new Error("Method not implemented.");
  }

  despawnEnemy(enemy: IEnemy): void {
    throw new Error("Method not implemented.");
  }

  getIsStarted(): boolean {
    throw new Error("Method not implemented.");
  }

  canBuy(placeable: Placeable, amount?: number | undefined): boolean {
    throw new Error("Method not implemented.");
  }

  start(): void {
    throw new Error("Method not implemented.");
  }

  showMessage: MessageFn = () => {
    throw new Error("Method not implemented.");
  };

  consume(
    agent: Agent,
    speedMultiplier?: number | undefined,
    damageMultiplier?: number | undefined
  ): boolean {
    throw new Error("Method not implemented.");
  }

  consumeContinuous(
    agent: Agent,
    dt: number,
    damageMultiplie?: number | undefined
  ): boolean {
    throw new Error("Method not implemented.");
  }

  getIsBaseDestroyed(): boolean {
    throw new Error("Method not implemented.");
  }

  getDamageMultiplier(): number {
    throw new Error("Method not implemented.");
  }
}

export default TestManager;
