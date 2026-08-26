import { describe, it, expect } from "vitest";
import { EventBuffer } from "../../src/lib/eventBuffer.js";
import { RecordedEvent } from "../../src/lib/events.js";

const clickEvent: RecordedEvent = {
  type: "click",
  kind: "click",
  timestamp: 1000,
  selector: "#submit",
};

describe("EventBuffer", () => {
  it("starts empty", () => {
    const buffer = new EventBuffer();
    expect(buffer.count()).toBe(0);
    expect(buffer.getAll()).toEqual([]);
  });

  it("accumulates pushed events in order", () => {
    const buffer = new EventBuffer();
    const consoleEvent: RecordedEvent = {
      type: "console",
      timestamp: 1100,
      level: "log",
      message: "hi",
    };

    buffer.push(clickEvent);
    buffer.push(consoleEvent);

    expect(buffer.count()).toBe(2);
    expect(buffer.getAll()).toEqual([clickEvent, consoleEvent]);
  });

  it("getAll returns a snapshot that isn't mutated by further pushes", () => {
    const buffer = new EventBuffer();
    buffer.push(clickEvent);
    const snapshot = buffer.getAll();

    buffer.push({
      type: "console",
      timestamp: 1200,
      level: "warn",
      message: "later",
    });

    expect(snapshot).toHaveLength(1);
    expect(buffer.count()).toBe(2);
  });

  it("clear empties the buffer", () => {
    const buffer = new EventBuffer();
    buffer.push(clickEvent);
    buffer.clear();
    expect(buffer.count()).toBe(0);
    expect(buffer.getAll()).toEqual([]);
  });
});
