import { describe, it, expect } from "vitest";
import {
  summarizeEvent,
  eventKindClass,
} from "../../src/content/panel/summarizeEvent.js";
import { RecordedEvent } from "../../src/lib/events.js";

describe("summarizeEvent", () => {
  it("summarizes a network event", () => {
    const event: RecordedEvent = {
      type: "network",
      timestamp: 1,
      url: "https://api.example.com/x",
      method: "GET",
      status: 200,
      requestHeaders: [],
      responseHeaders: [],
    };
    expect(summarizeEvent(event)).toBe("GET 200 https://api.example.com/x");
    expect(eventKindClass(event)).toBe("network");
  });

  it("summarizes a console event", () => {
    const event: RecordedEvent = {
      type: "console",
      timestamp: 1,
      level: "error",
      message: "boom",
    };
    expect(summarizeEvent(event)).toBe("[error] boom");
    expect(eventKindClass(event)).toBe("console");
  });

  it("summarizes a click interaction event", () => {
    const event: RecordedEvent = {
      type: "click",
      kind: "click",
      timestamp: 1,
      selector: "#submit",
    };
    expect(summarizeEvent(event)).toBe("click #submit");
    expect(eventKindClass(event)).toBe("click");
  });

  it("summarizes an input interaction event with its value", () => {
    const event: RecordedEvent = {
      type: "click",
      kind: "input",
      timestamp: 1,
      selector: "#email",
      value: "a@b.com",
    };
    expect(summarizeEvent(event)).toBe("input #email = a@b.com");
  });

  it("summarizes a navigate interaction event", () => {
    const event: RecordedEvent = {
      type: "click",
      kind: "navigate",
      timestamp: 1,
      selector: "",
      url: "https://example.com/next",
    };
    expect(summarizeEvent(event)).toBe("navigate https://example.com/next");
  });
});
