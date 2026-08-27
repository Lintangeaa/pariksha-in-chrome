import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { EventPanel } from "../../src/content/panel/EventPanel.js";
import { RecordedEvent } from "../../src/lib/events.js";

function mountInto() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return container;
}

describe("EventPanel", () => {
  it("shows an empty state while recording with no events yet", () => {
    const container = mountInto();
    render(
      <EventPanel recording={true} events={[]} onClose={() => {}} />,
      container,
    );

    expect(container.textContent).toContain("Waiting for events");
  });

  it("renders the live event list, most recent first", () => {
    const container = mountInto();
    const events: RecordedEvent[] = [
      { type: "click", kind: "click", timestamp: 1, selector: "#a" },
      { type: "console", timestamp: 2, level: "log", message: "hello" },
    ];
    render(
      <EventPanel recording={true} events={events} onClose={() => {}} />,
      container,
    );

    const items = container.querySelectorAll(".pariksha-event-item");
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain("hello");
    expect(items[1].textContent).toContain("#a");
  });

  it("does not render the event list while not recording", () => {
    const container = mountInto();
    render(
      <EventPanel
        recording={false}
        events={[{ type: "console", timestamp: 1, level: "log", message: "x" }]}
        onClose={() => {}}
      />,
      container,
    );

    expect(container.querySelector(".pariksha-event-list")).toBeNull();
  });

  it("calls onClose when the close button is clicked", () => {
    const container = mountInto();
    const onClose = vi.fn();
    render(
      <EventPanel recording={false} events={[]} onClose={onClose} />,
      container,
    );

    (container.querySelector(".pariksha-close-btn") as HTMLButtonElement).click();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders children (the setup form slot) above the event list", () => {
    const container = mountInto();
    render(
      <EventPanel recording={false} events={[]} onClose={() => {}}>
        <div data-testid="setup-slot">setup content</div>
      </EventPanel>,
      container,
    );

    expect(container.textContent).toContain("setup content");
  });
});
