import { buildSelector } from "./selector.js";
import { buildInteractionEvent } from "./buildEvent.js";
import { InteractionEvent } from "./events.js";

/** Builds a click event for the clicked element. */
export function handleClickTarget(
  target: Element,
  timestamp: number,
): InteractionEvent {
  return buildInteractionEvent({
    timestamp,
    kind: "click",
    selector: buildSelector(target),
  });
}

/** Builds an input event for a form field, redacting the value when it's `type="password"`. */
export function handleInputTarget(
  target: HTMLInputElement | HTMLTextAreaElement,
  timestamp: number,
): InteractionEvent {
  const fieldType = "type" in target ? target.type : "text";
  return buildInteractionEvent({
    timestamp,
    kind: "input",
    selector: buildSelector(target),
    value: target.value,
    fieldType,
  });
}

/** Builds a navigation event for a URL the page navigated to. */
export function handleNavigation(
  url: string,
  timestamp: number,
): InteractionEvent {
  return buildInteractionEvent({
    timestamp,
    kind: "navigate",
    selector: "",
    url,
  });
}
