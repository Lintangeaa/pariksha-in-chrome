import { installConsoleHook } from "../lib/consoleHook.js";
import {
  handleClickTarget,
  handleInputTarget,
  handleNavigation,
} from "../lib/contentHandlers.js";
import { RecordedEvent } from "../lib/events.js";

let uninstallConsoleHook: (() => void) | null = null;

function sendEvent(event: RecordedEvent): void {
  chrome.runtime.sendMessage({ type: "RECORDED_EVENT", event }).catch(() => {
    // Background service worker may briefly be inactive between wake-ups — safe to drop.
  });
}

function onClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) return;
  sendEvent(handleClickTarget(event.target, Date.now()));
}

function onInput(event: Event): void {
  const target = event.target;
  if (
    !(target instanceof HTMLInputElement) &&
    !(target instanceof HTMLTextAreaElement)
  )
    return;
  sendEvent(handleInputTarget(target, Date.now()));
}

function startCapturing(): void {
  if (uninstallConsoleHook) return;
  uninstallConsoleHook = installConsoleHook(sendEvent);
  document.addEventListener("click", onClick, true);
  document.addEventListener("input", onInput, true);
}

function stopCapturing(): void {
  uninstallConsoleHook?.();
  uninstallConsoleHook = null;
  document.removeEventListener("click", onClick, true);
  document.removeEventListener("input", onInput, true);
}

// A fresh page load re-injects this script — ask the background service
// worker whether a recording session is already in progress so a page
// navigated to mid-recording still gets captured (and logged as a
// navigation event itself).
chrome.runtime.sendMessage({ type: "GET_STATUS" }).then((response) => {
  if (response?.recording) {
    startCapturing();
    sendEvent(handleNavigation(location.href, Date.now()));
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "START_RECORDING") startCapturing();
  if (message?.type === "STOP_RECORDING") stopCapturing();
});
