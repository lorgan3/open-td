import { Container } from "pixi.js";

export const FLOOR = new Container();
FLOOR.name = "Floor";

/**
 * Container should only contain sprites directly, I might make this a particle container.
 * Intended for simple static entities only.
 */
export const STATIC = new Container();
STATIC.name = "Static";

export const BASE = new Container();
BASE.name = "Base";

/**
 * Container should only contain sprites directly, I might make this a particle container.
 * Intended for simple static entities that should overlap the static layer only.
 */
export const FOLIAGE = new Container();
FOLIAGE.name = "Foliage";

export const PROJECTILES = new Container();
PROJECTILES.name = "Projectiles";

export const TOWERS = new Container();
TOWERS.name = "Towers";

export const UI = new Container();
UI.name = "UI";

export const LAYERS = [FLOOR, STATIC, BASE, FOLIAGE, PROJECTILES, TOWERS, UI];
