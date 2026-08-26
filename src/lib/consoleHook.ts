import { buildConsoleEvent } from "./buildEvent.js";
import { ConsoleEvent } from "./events.js";

type ConsoleLevel = "log" | "warn" | "error";
const HOOKED_LEVELS: ConsoleLevel[] = ["log", "warn", "error"];

/**
 * Wraps `console.log`/`warn`/`error` so every call also produces a
 * structured event, without suppressing the original console output.
 * Returns a function that restores the original methods.
 */
export function installConsoleHook(
  onCapture: (event: ConsoleEvent) => void,
  timestamp: () => number = Date.now,
  consoleObj: Console = console,
): () => void {
  const originals = HOOKED_LEVELS.map((level) => consoleObj[level]);

  HOOKED_LEVELS.forEach((level, index) => {
    consoleObj[level] = (...args: unknown[]) => {
      originals[index].apply(consoleObj, args);
      onCapture(
        buildConsoleEvent({
          timestamp: timestamp(),
          level,
          message: args
            .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
            .join(" "),
        }),
      );
    };
  });

  return () => {
    HOOKED_LEVELS.forEach((level, index) => {
      consoleObj[level] = originals[index];
    });
  };
}
