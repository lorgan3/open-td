import { Container, ParticleContainer } from "pixi.js";

export const FLOOR = new Container();
FLOOR.name = "Floor";

/**
 * Intended for simple static entities only.
 */
export const STATIC = new ParticleContainer(
  undefined,
  { position: false },
  undefined,
  true
);
STATIC.name = "Static";

export const BASE = new Container();
BASE.name = "Base";

/**
 * Intended for simple static entities that should overlap the static layer only.
 */
export const FOLIAGE = new ParticleContainer(
  undefined,
  { position: false },
  undefined,
  true
);
FOLIAGE.name = "Foliage";

export const PROJECTILES = new Container();
PROJECTILES.name = "Projectiles";

export const TOWERS = new Container();
TOWERS.name = "Towers";

export const UI = new Container();
UI.name = "UI";

export const LAYERS = [FLOOR, STATIC, BASE, FOLIAGE, PROJECTILES, TOWERS, UI];
