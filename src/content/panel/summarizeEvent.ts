import { RecordedEvent } from "../../lib/events.js";

/** One-line human-readable summary of a captured event, for the live list in EventPanel. */
export function summarizeEvent(event: RecordedEvent): string {
  switch (event.type) {
    case "network":
      return `${event.method} ${event.status} ${event.url}`;
    case "console":
      return `[${event.level}] ${event.message}`;
    case "click":
      switch (event.kind) {
        case "click":
          return `click ${event.selector}`;
        case "input":
          return `input ${event.selector}${event.value ? ` = ${event.value}` : ""}`;
        case "navigate":
          return `navigate ${event.url ?? ""}`;
        default:
          return event.selector;
      }
    default:
      return "event";
  }
}

/** CSS class suffix (`.pariksha-event-type.<kind>`) used to color-code an event row. */
export function eventKindClass(event: RecordedEvent): "network" | "console" | "click" {
  if (event.type === "network") return "network";
  if (event.type === "console") return "console";
  return "click";
}
