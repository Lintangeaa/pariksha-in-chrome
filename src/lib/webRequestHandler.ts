import { HttpHeader } from "./redact.js";
import { buildNetworkEvent } from "./buildEvent.js";
import { NetworkEvent } from "./events.js";

/**
 * The subset of chrome.webRequest details, correlated by requestId across
 * its onBeforeRequest/onSendHeaders/onCompleted callbacks, that this
 * function needs. Kept as a plain interface (rather than depending on
 * chrome.webRequest's own types) so this function stays a pure, easily
 * fixture-tested unit — the correlation itself happens in background.ts.
 */
export interface RawWebRequestDetails {
  url: string;
  method: string;
  statusCode: number;
  timeStamp: number;
  requestHeaders: HttpHeader[];
  responseHeaders: HttpHeader[];
  requestBody?: unknown;
}

/** Builds a structured, already-redacted network event from one correlated web request. */
export function handleWebRequestEvent(
  details: RawWebRequestDetails,
): NetworkEvent {
  return buildNetworkEvent({
    timestamp: details.timeStamp,
    url: details.url,
    method: details.method,
    statusCode: details.statusCode,
    requestHeaders: details.requestHeaders,
    responseHeaders: details.responseHeaders,
    requestBody: details.requestBody,
  });
}
