import { RecordedEvent } from "./events.js";

/** In-memory buffer for events captured during one recording session. */
export class EventBuffer {
  private events: RecordedEvent[] = [];

  push(event: RecordedEvent): void {
    this.events.push(event);
  }

  getAll(): RecordedEvent[] {
    return [...this.events];
  }

  count(): number {
    return this.events.length;
  }

  clear(): void {
    this.events = [];
  }
}
