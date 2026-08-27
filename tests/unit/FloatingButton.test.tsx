import { describe, it, expect, vi } from "vitest";
import { render } from "preact";
import { FloatingButton } from "../../src/content/panel/FloatingButton.js";

function mountInto() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return container;
}

describe("FloatingButton", () => {
  it("renders and calls onClick when clicked", () => {
    const container = mountInto();
    const onClick = vi.fn();
    render(<FloatingButton recording={false} onClick={onClick} />, container);

    const button = container.querySelector("button")!;
    expect(button).toBeTruthy();
    expect(button.className).not.toContain("recording");

    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("marks itself as recording via a CSS class when recording is true", () => {
    const container = mountInto();
    render(<FloatingButton recording={true} onClick={() => {}} />, container);

    expect(container.querySelector("button")!.className).toContain("recording");
  });
});
