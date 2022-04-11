export enum PoolType {
  Growing = 0,
  Fixed = 1,
}

class Pool<I, O> {
  private size: number;
  private freeEntities: O[] = [];
  private usedEntities = new Map<I, O>();

  /**
   * Create a pool of entities of entities that can be reused.
   * Useful for when creating or destroying these entities is expensive.
   *
   * @param initializer A function to create or activate an entity.
   * If the entity must be activated it will be passed as the second argument, otherwise a new entity must be created.
   * @param type A growing pool will grow if more entities are requested, a fixed one will throw an error.
   * @param initialSize The amount of elements to initialize on startup.
   */
  constructor(
    private initializer: (active: boolean, original?: O, input?: I) => O,
    private type = PoolType.Growing,
    initialSize = 10
  ) {
    this.size = initialSize;
    for (let i = 0; i < initialSize; i++) {
      this.freeEntities.push(initializer(false));
    }
  }

  get(input: I) {
    let entity = this.usedEntities.get(input);
    if (entity) {
      return entity;
    }

    if (this.freeEntities.length === 0) {
      if (this.type === PoolType.Fixed) {
        throw new Error("Pool is empty");
      }
      this.size++;
    }

    entity = this.initializer(true, this.freeEntities.pop(), input);
    this.usedEntities.set(input, entity);
    return entity;
  }

  /**
   * The entity must be deactivated manually when this function is called.
   */
  free(input: I) {
    if (!this.usedEntities.has(input)) {
      return;
    }

    let entity = this.usedEntities.get(input)!;
    this.usedEntities.delete(input);
    this.freeEntities.push(entity);

    return entity;
  }

  getSize() {
    return this.size;
  }
}

export default Pool;
