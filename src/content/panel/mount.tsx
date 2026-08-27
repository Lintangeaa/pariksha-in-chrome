import { render } from "preact";
import { PANEL_CSS } from "./theme.js";
import { PanelRoot } from "./PanelRoot.js";

/**
 * Mounts the floating button + panel into a Shadow DOM root appended to
 * `document.body`, isolated from both the recorded page's own DOM and its
 * CSS. Separate from content-script.ts's network/console/click capture
 * logic — this only owns the UI, capture keeps running independently.
 */
export function mountPanel(): void {
  const host = document.createElement("div");
  host.id = "pariksha-in-chrome-root";
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = PANEL_CSS;
  shadow.appendChild(style);

  const container = document.createElement("div");
  container.className = "pariksha-root";
  shadow.appendChild(container);

  document.body.appendChild(host);
  render(<PanelRoot />, container);
}
