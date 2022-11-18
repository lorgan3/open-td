import { Container } from "pixi.js";

export const BASE = new Container();
BASE.name = "Base";

export const PROJECTILES = new Container();
PROJECTILES.name = "Projectiles";

export const TOWERS = new Container();
TOWERS.name = "Towers";

export const UI = new Container();
UI.name = "UI";

export const LAYERS = [BASE, PROJECTILES, TOWERS, UI];
