import { describe, it, expect } from "vitest";
import { handleWebRequestEvent } from "../../src/lib/webRequestHandler.js";
import { REDACTED } from "../../src/lib/redact.js";

describe("handleWebRequestEvent", () => {
  it("builds a structured, redacted network event from a fixture request", () => {
    const event = handleWebRequestEvent({
      url: "https://example.com/api/login?token=abc123",
      method: "POST",
      statusCode: 200,
      timeStamp: 1719400000000,
      requestHeaders: [{ name: "Authorization", value: "Bearer xyz" }],
      responseHeaders: [{ name: "Content-Type", value: "application/json" }],
      requestBody: { username: "alice", password: "hunter2" },
    });

    expect(event.type).toBe("network");
    expect(event.method).toBe("POST");
    expect(event.status).toBe(200);
    expect(event.timestamp).toBe(1719400000000);
    expect(event.url).toContain(`token=${encodeURIComponent(REDACTED)}`);
    expect(event.requestHeaders).toEqual([
      { name: "Authorization", value: REDACTED },
    ]);
    expect(event.requestBody).toEqual({
      username: "alice",
      password: REDACTED,
    });
  });

  it("omits requestBody when the fixture request had none", () => {
    const event = handleWebRequestEvent({
      url: "https://example.com/api/users",
      method: "GET",
      statusCode: 200,
      timeStamp: 1719400000000,
      requestHeaders: [],
      responseHeaders: [],
    });

    expect("requestBody" in event).toBe(false);
  });
});
