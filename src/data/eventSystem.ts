import { EventHandler, EventParamsMap, GameEvent } from "./events";

class EventSystem {
  private static instance: EventSystem;

  private eventHandlers: Map<GameEvent, Set<EventHandler<any>>>;

  constructor() {
    EventSystem.instance = this;
    this.eventHandlers = new Map();
  }

  addEventListener<E extends keyof EventParamsMap>(
    event: E,
    fn: EventHandler<E>
  ) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event)!.add(fn);
    } else {
      this.eventHandlers.set(event, new Set([fn]));
    }

    return () => this.removeEventListener(event, fn);
  }

  addEventListeners(events: GameEvent[], fn: EventHandler<any>) {
    const removeEventListeners = events.map((event) =>
      this.addEventListener(event, fn)
    );

    return () => removeEventListeners.forEach((fn) => fn());
  }

  removeEventListener<E extends keyof EventParamsMap>(
    event: E,
    fn: EventHandler<E>
  ) {
    this.eventHandlers.get(event)?.delete(fn);
  }

  triggerEvent<E extends keyof EventParamsMap>(
    event: E,
    ...params: EventParamsMap[E]
  ) {
    this.eventHandlers.get(event)?.forEach((fn) => fn(...params));
  }

  static get Instance() {
    return this.instance;
  }
}

export default EventSystem;
