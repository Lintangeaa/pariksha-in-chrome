// Palette derived from assets/logo.png in the pariksha monorepo (green
// ribbon "P" mark on a dark charcoal background) — defined once here and
// injected as CSS custom properties into the Shadow DOM root so both
// FloatingButton and EventPanel reference the same tokens instead of
// hardcoding colors per component.
export const PANEL_CSS = `
:host {
  all: initial;
}

* {
  box-sizing: border-box;
}

.pariksha-root {
  --pariksha-green: #22c55e;
  --pariksha-green-dark: #16a34a;
  --pariksha-charcoal: #1c1f22;
  --pariksha-charcoal-light: #2a2e33;
  --pariksha-fg: #f4f4f5;
  --pariksha-muted: #a1a1aa;
  --pariksha-danger: #ef4444;
  font-family:
    -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue",
    Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: var(--pariksha-fg);
}

.pariksha-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--pariksha-green);
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.pariksha-fab:hover {
  transform: scale(1.06);
  background: var(--pariksha-green-dark);
}

.pariksha-fab.recording {
  background: var(--pariksha-danger);
}

.pariksha-fab svg {
  width: 24px;
  height: 24px;
}

.pariksha-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  background: var(--pariksha-charcoal);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
  z-index: 2147483001;
  display: flex;
  flex-direction: column;
  transform: translateX(0);
}

.pariksha-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--pariksha-charcoal-light);
}

.pariksha-panel-header h1 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.pariksha-close-btn {
  background: transparent;
  border: none;
  color: var(--pariksha-muted);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 4px;
}

.pariksha-close-btn:hover {
  color: var(--pariksha-fg);
}

.pariksha-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.pariksha-field {
  display: block;
  margin-top: 10px;
  font-size: 11px;
  color: var(--pariksha-muted);
}

.pariksha-input,
.pariksha-select,
.pariksha-btn {
  width: 100%;
  box-sizing: border-box;
  padding: 7px 8px;
  margin-top: 3px;
  border-radius: 6px;
  border: 1px solid var(--pariksha-charcoal-light);
  background: var(--pariksha-charcoal-light);
  color: var(--pariksha-fg);
  font-size: 13px;
}

.pariksha-btn {
  cursor: pointer;
  border: none;
  background: var(--pariksha-green);
  color: #08170d;
  font-weight: 600;
  margin-top: 12px;
}

.pariksha-btn:hover {
  background: var(--pariksha-green-dark);
}

.pariksha-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pariksha-btn.danger {
  background: var(--pariksha-danger);
  color: #fff;
}

.pariksha-status {
  margin-top: 10px;
  font-size: 12px;
  color: var(--pariksha-muted);
}

.pariksha-error {
  color: var(--pariksha-danger);
  font-size: 12px;
  margin-top: 6px;
}

.pariksha-event-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pariksha-event-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--pariksha-charcoal-light);
  font-size: 12px;
}

.pariksha-event-type {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  border-radius: 4px;
  margin-right: 6px;
}

.pariksha-event-type.network {
  background: #1d4ed8;
  color: #dbeafe;
}

.pariksha-event-type.console {
  background: var(--pariksha-charcoal-light);
  color: var(--pariksha-muted);
}

.pariksha-event-type.click {
  background: var(--pariksha-green-dark);
  color: #dcfce7;
}

.pariksha-empty {
  color: var(--pariksha-muted);
  font-size: 12px;
  text-align: center;
  padding: 24px 0;
}
`;
