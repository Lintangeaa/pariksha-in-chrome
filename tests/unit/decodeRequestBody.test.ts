import { describe, it, expect } from "vitest";
import { decodeRequestBody } from "../../src/lib/decodeRequestBody.js";
import { REDACTED } from "../../src/lib/redact.js";

function bytesOf(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer;
}

describe("decodeRequestBody", () => {
  it("returns undefined when there is no request body", () => {
    expect(decodeRequestBody(undefined)).toBeUndefined();
  });

  it("passes formData through as a plain object (already structured)", () => {
    const result = decodeRequestBody({
      formData: { username: ["alice"], password: ["hunter2"] },
    });
    expect(result).toEqual({ username: ["alice"], password: ["hunter2"] });
  });

  it("decodes and JSON.parses a raw JSON body", () => {
    const result = decodeRequestBody({
      raw: [{ bytes: bytesOf('{"username":"alice","password":"hunter2"}') }],
    });
    expect(result).toEqual({ username: "alice", password: "hunter2" });
  });

  it("concatenates multiple raw chunks before parsing", () => {
    const result = decodeRequestBody({
      raw: [{ bytes: bytesOf('{"username":"al') }, { bytes: bytesOf('ice"}') }],
    });
    expect(result).toEqual({ username: "alice" });
  });

  it("falls back to a redacted string when the raw body isn't valid JSON", () => {
    const result = decodeRequestBody({
      raw: [{ bytes: bytesOf("username=alice&password=hunter2") }],
    });
    expect(result).toBe(`username=alice&password=${REDACTED}`);
  });

  it("returns undefined for an empty raw array", () => {
    expect(decodeRequestBody({ raw: [] })).toBeUndefined();
  });
});
