import { describe, it, expect } from "vitest";
import {
  redactHeaders,
  redactSensitiveKeys,
  redactFormFieldValue,
  redactUrlQueryParams,
  redactRawBodyText,
  REDACTED,
} from "../../src/lib/redact.js";

describe("redactHeaders", () => {
  it("masks Authorization and Cookie headers, case-insensitively", () => {
    const result = redactHeaders([
      { name: "Authorization", value: "Bearer abc123" },
      { name: "cookie", value: "session=xyz" },
      { name: "Content-Type", value: "application/json" },
    ]);

    expect(result).toEqual([
      { name: "Authorization", value: REDACTED },
      { name: "cookie", value: REDACTED },
      { name: "Content-Type", value: "application/json" },
    ]);
  });

  it("leaves non-sensitive headers untouched", () => {
    const result = redactHeaders([{ name: "X-Request-Id", value: "req-1" }]);
    expect(result).toEqual([{ name: "X-Request-Id", value: "req-1" }]);
  });
});

describe("redactSensitiveKeys", () => {
  it("masks token/api_key/secret/password keys in a flat object", () => {
    const result = redactSensitiveKeys({
      username: "alice",
      password: "hunter2",
      api_key: "sk-123",
      token: "eyJ...",
      client_secret: "shh",
    });

    expect(result).toEqual({
      username: "alice",
      password: REDACTED,
      api_key: REDACTED,
      token: REDACTED,
      client_secret: REDACTED,
    });
  });

  it("recurses into nested objects and arrays", () => {
    const result = redactSensitiveKeys({
      user: { name: "alice", password: "hunter2" },
      items: [{ token: "abc" }, { note: "fine" }],
    });

    expect(result).toEqual({
      user: { name: "alice", password: REDACTED },
      items: [{ token: REDACTED }, { note: "fine" }],
    });
  });

  it("returns primitives unchanged", () => {
    expect(redactSensitiveKeys("plain string")).toBe("plain string");
    expect(redactSensitiveKeys(42)).toBe(42);
    expect(redactSensitiveKeys(null)).toBe(null);
  });
});

describe("redactUrlQueryParams", () => {
  it("masks sensitive query params while keeping others intact", () => {
    const result = redactUrlQueryParams(
      "https://example.com/api/login?token=abc123&username=alice",
    );
    const parsed = new URL(result);
    expect(parsed.searchParams.get("token")).toBe(REDACTED);
    expect(parsed.searchParams.get("username")).toBe("alice");
  });

  it("returns the URL unchanged when it has no sensitive params", () => {
    const result = redactUrlQueryParams("https://example.com/api/users?page=2");
    expect(result).toBe("https://example.com/api/users?page=2");
  });

  it("returns the input unchanged when it isn't a parseable absolute URL", () => {
    expect(redactUrlQueryParams("/relative/path?token=abc")).toBe(
      "/relative/path?token=abc",
    );
  });
});

describe("redactRawBodyText", () => {
  it("masks sensitive keys in a URL-encoded form body string", () => {
    expect(redactRawBodyText("username=alice&password=hunter2")).toBe(
      `username=alice&password=${REDACTED}`,
    );
  });

  it("masks sensitive keys in a malformed/partial JSON-like body", () => {
    expect(redactRawBodyText('{"username":"alice","token":"abc123"}')).toBe(
      `{"username":"alice","token":"${REDACTED}"}`,
    );
  });

  it("leaves non-sensitive content untouched", () => {
    expect(redactRawBodyText("page=2&sort=asc")).toBe("page=2&sort=asc");
  });
});

describe("redactFormFieldValue", () => {
  it("masks the value when the field type is password", () => {
    expect(redactFormFieldValue("password", "hunter2")).toBe(REDACTED);
    expect(redactFormFieldValue("PASSWORD", "hunter2")).toBe(REDACTED);
  });

  it("leaves non-password field values untouched", () => {
    expect(redactFormFieldValue("text", "alice")).toBe("alice");
    expect(redactFormFieldValue("email", "alice@example.com")).toBe(
      "alice@example.com",
    );
  });
});
