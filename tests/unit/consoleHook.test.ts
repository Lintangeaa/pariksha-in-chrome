import { describe, it, expect, vi } from "vitest";
import { installConsoleHook } from "../../src/lib/consoleHook.js";

function fakeConsole() {
  return {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Console;
}

describe("installConsoleHook", () => {
  it("captures log/warn/error calls as structured events", () => {
    const captured: unknown[] = [];
    const console = fakeConsole();

    installConsoleHook(
      (event) => captured.push(event),
      () => 1000,
      console,
    );

    console.log("hello");
    console.warn("careful");
    console.error("boom");

    expect(captured).toEqual([
      { type: "console", timestamp: 1000, level: "log", message: "hello" },
      { type: "console", timestamp: 1000, level: "warn", message: "careful" },
      { type: "console", timestamp: 1000, level: "error", message: "boom" },
    ]);
  });

  it("still calls the original console method (doesn't suppress output)", () => {
    const captured: unknown[] = [];
    const console = fakeConsole();
    const originalLog = console.log;

    installConsoleHook(
      (event) => captured.push(event),
      () => 1000,
      console,
    );
    console.log("hello");

    expect(originalLog).toHaveBeenCalledWith("hello");
  });

  it("joins multiple/non-string arguments into one message", () => {
    const captured: any[] = [];
    const console = fakeConsole();

    installConsoleHook(
      (event) => captured.push(event),
      () => 1000,
      console,
    );
    console.log("count:", 42, { ok: true });

    expect(captured[0].message).toBe('count: 42 {"ok":true}');
  });

  it("returns a function that restores the original console methods", () => {
    const console = fakeConsole();
    const originalLog = console.log;

    const restore = installConsoleHook(
      () => {},
      () => 1000,
      console,
    );
    expect(console.log).not.toBe(originalLog);

    restore();
    expect(console.log).toBe(originalLog);
  });
});
