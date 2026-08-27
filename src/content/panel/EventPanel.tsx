import type { ComponentChildren } from "preact";
import { RecordedEvent } from "../../lib/events.js";
import { summarizeEvent, eventKindClass } from "./summarizeEvent.js";

export interface EventPanelProps {
  recording: boolean;
  events: RecordedEvent[];
  onClose: () => void;
  children?: ComponentChildren;
}

/** Right-side slide-in panel: setup controls (via `children`) above a live event stream while recording. */
export function EventPanel({ recording, events, onClose, children }: EventPanelProps) {
  return (
    <div class="pariksha-panel">
      <div class="pariksha-panel-header">
        <h1>Pariksha In Chrome</h1>
        <button type="button" class="pariksha-close-btn" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>
      <div class="pariksha-panel-body">
        {children}
        {recording && (
          <>
            {events.length === 0 ? (
              <p class="pariksha-empty">Waiting for events…</p>
            ) : (
              <ul class="pariksha-event-list">
                {events
                  .slice()
                  .reverse()
                  .map((event, index) => (
                    <li key={events.length - index} class="pariksha-event-item">
                      <span class={`pariksha-event-type ${eventKindClass(event)}`}>
                        {eventKindClass(event)}
                      </span>
                      {summarizeEvent(event)}
                    </li>
                  ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
