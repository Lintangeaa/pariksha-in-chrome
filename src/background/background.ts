import { EventBuffer } from "../lib/eventBuffer.js";
import {
  handleWebRequestEvent,
  RawWebRequestDetails,
} from "../lib/webRequestHandler.js";
import { decodeRequestBody } from "../lib/decodeRequestBody.js";
import { uploadRecordedSession } from "../lib/apiClient.js";
import { loadToken } from "../lib/tokenStorage.js";
import { RecordedEvent } from "../lib/events.js";

// Inlined at build time by esbuild.config.mjs — see .env.example.
const BACKEND_URL = process.env.PARIKSHA_BACKEND_URL as string;

const buffer = new EventBuffer();
let recording = false;
let recordingPbId: string | null = null;
let recordingStartedAt: string | null = null;

// Correlates chrome.webRequest's onBeforeRequest/onSendHeaders/onCompleted
// callbacks (fired separately for the same request) by requestId.
const pendingRequests = new Map<string, Partial<RawWebRequestDetails>>();

function updateBadge(): void {
  chrome.action.setBadgeText({ text: recording ? "REC" : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#d93025" });
}

async function broadcastToAllTabs(message: unknown): Promise<void> {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id !== undefined) {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {
        // No content script listening in this tab (e.g. chrome:// pages) — fine to ignore.
      });
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!recording) return;
    pendingRequests.set(details.requestId, {
      url: details.url,
      method: details.method,
      timeStamp: details.timeStamp,
      // chrome.webRequest hands over an undecoded wrapper (formData object,
      // or raw bytes for a JSON body) — decode it here so redaction further
      // down the pipeline can actually see and mask sensitive field names.
      requestBody: decodeRequestBody(details.requestBody ?? undefined),
    });
  },
  { urls: ["<all_urls>"] },
  ["requestBody"],
);

chrome.webRequest.onSendHeaders.addListener(
  (details) => {
    const pending = pendingRequests.get(details.requestId);
    if (pending) pending.requestHeaders = details.requestHeaders ?? [];
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"],
);

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (!recording) return;
    const pending = pendingRequests.get(details.requestId);
    pendingRequests.delete(details.requestId);
    if (!pending) return;

    buffer.push(
      handleWebRequestEvent({
        url: pending.url ?? details.url,
        method: pending.method ?? details.method,
        statusCode: details.statusCode,
        timeStamp: pending.timeStamp ?? details.timeStamp,
        requestHeaders: pending.requestHeaders ?? [],
        responseHeaders: details.responseHeaders ?? [],
        requestBody: pending.requestBody,
      }),
    );
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"],
);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message?.type) {
    case "GET_STATUS":
      sendResponse({ recording });
      return undefined;

    case "START_RECORDING":
      recording = true;
      recordingPbId = message.pbId;
      recordingStartedAt = new Date().toISOString();
      buffer.clear();
      pendingRequests.clear();
      updateBadge();
      broadcastToAllTabs({ type: "START_RECORDING" });
      sendResponse({ ok: true });
      return undefined;

    case "STOP_RECORDING":
      recording = false;
      updateBadge();
      broadcastToAllTabs({ type: "STOP_RECORDING" });
      sendResponse({ eventCount: buffer.count() });
      return undefined;

    case "RECORDED_EVENT":
      if (recording) buffer.push(message.event as RecordedEvent);
      return undefined;

    case "UPLOAD_RECORDING":
      void (async () => {
        const token = await loadToken();
        if (!token || !recordingPbId || !recordingStartedAt) {
          sendResponse({ ok: false, error: "Not recording" });
          return;
        }
        try {
          const session = await uploadRecordedSession(
            BACKEND_URL,
            token,
            recordingPbId,
            {
              startedAt: recordingStartedAt,
              finishedAt: new Date().toISOString(),
              events: buffer.getAll(),
            },
          );
          buffer.clear();
          recordingPbId = null;
          recordingStartedAt = null;
          sendResponse({ ok: true, session });
        } catch (err) {
          sendResponse({
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      })();
      return true; // keep the message channel open for the async sendResponse above

    default:
      return undefined;
  }
});
