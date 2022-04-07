let id = 1;

export interface Agent {
  entity: Entity;
  getType(): EntityType;
}

export enum EntityType {
  Tower = 1,
  Slime = 2,
  Base = 3,
}

class Entity {
  private id: number;

  constructor(private x: number, private y: number, private agent: Agent) {
    this.id = id++;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getAgent() {
    return this.agent;
  }

  getId() {
    return this.id;
  }

  setX(x: number) {
    this.x = x;
  }

  setY(y: number) {
    this.y = y;
  }
}

export default Entity;
