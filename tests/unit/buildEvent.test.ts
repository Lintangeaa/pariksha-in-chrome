import { describe, it, expect } from "vitest";
import {
  buildNetworkEvent,
  buildConsoleEvent,
  buildInteractionEvent,
} from "../../src/lib/buildEvent.js";
import { REDACTED } from "../../src/lib/redact.js";

describe("buildNetworkEvent", () => {
  it("builds a structured network event with headers, query params, and body already redacted", () => {
    const event = buildNetworkEvent({
      timestamp: 1000,
      url: "https://example.com/api/login?token=abc123&username=alice",
      method: "POST",
      statusCode: 200,
      requestHeaders: [{ name: "Authorization", value: "Bearer xyz" }],
      responseHeaders: [{ name: "Content-Type", value: "application/json" }],
      requestBody: { username: "alice", password: "hunter2" },
    });

    expect(event.type).toBe("network");
    expect(event.timestamp).toBe(1000);
    expect(event.method).toBe("POST");
    expect(event.status).toBe(200);
    expect(event.url).toContain(`token=${encodeURIComponent(REDACTED)}`);
    expect(event.url).toContain("username=alice");
    expect(event.requestHeaders).toEqual([
      { name: "Authorization", value: REDACTED },
    ]);
    expect(event.requestBody).toEqual({
      username: "alice",
      password: REDACTED,
    });
  });

  it("omits requestBody entirely when none was captured (e.g. a GET request)", () => {
    const event = buildNetworkEvent({
      timestamp: 1000,
      url: "https://example.com/api/users",
      method: "GET",
      statusCode: 200,
      requestHeaders: [],
      responseHeaders: [],
    });

    expect("requestBody" in event).toBe(false);
  });
});

describe("buildConsoleEvent", () => {
  it("builds a structured console event", () => {
    const event = buildConsoleEvent({
      timestamp: 2000,
      level: "error",
      message: "boom",
    });
    expect(event).toEqual({
      type: "console",
      timestamp: 2000,
      level: "error",
      message: "boom",
    });
  });
});

describe("buildInteractionEvent", () => {
  it("builds a click event with the clicked element's selector", () => {
    const event = buildInteractionEvent({
      timestamp: 3000,
      kind: "click",
      selector: "#submit-button",
    });
    expect(event).toEqual({
      type: "click",
      kind: "click",
      timestamp: 3000,
      selector: "#submit-button",
    });
  });

  it("redacts the captured value for a password input field", () => {
    const event = buildInteractionEvent({
      timestamp: 3000,
      kind: "input",
      selector: "#password",
      value: "hunter2",
      fieldType: "password",
    });
    expect(event.value).toBe(REDACTED);
  });

  it("keeps the captured value for a non-password input field", () => {
    const event = buildInteractionEvent({
      timestamp: 3000,
      kind: "input",
      selector: "#email",
      value: "alice@example.com",
      fieldType: "email",
    });
    expect(event.value).toBe("alice@example.com");
  });

  it("builds a navigate event with the destination URL", () => {
    const event = buildInteractionEvent({
      timestamp: 4000,
      kind: "navigate",
      selector: "",
      url: "https://example.com/dashboard",
    });
    expect(event).toEqual({
      type: "click",
      kind: "navigate",
      timestamp: 4000,
      selector: "",
      url: "https://example.com/dashboard",
    });
  });
});
