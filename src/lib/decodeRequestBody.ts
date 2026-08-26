import { redactRawBodyText } from "./redact.js";

/**
 * The subset of chrome.webRequest.WebRequestBody this needs — kept as a
 * plain interface (like RawWebRequestDetails) so this stays pure and
 * fixture-testable without depending on @types/chrome's ambient types.
 */
export interface RawRequestBody {
  formData?: Record<string, string[]>;
  raw?: { bytes?: ArrayBuffer }[];
}

/**
 * Decodes chrome.webRequest's request body wrapper into something
 * `redactSensitiveKeys` can actually redact key-by-key:
 * - `formData` (form-urlencoded/multipart bodies) is already a plain
 *   object — passed through as-is.
 * - `raw` (any other body, notably JSON bodies from fetch/XHR — the
 *   common case for a login request) arrives as undecoded bytes; this
 *   decodes them to text and JSON.parses when possible.
 * - A `raw` body that isn't valid JSON falls back to `redactRawBodyText`,
 *   a best-effort string-level scrub, since there's no structured object
 *   for `redactSensitiveKeys` to walk.
 *
 * Without this step, a JSON request body (e.g. `{"password":"..."}`)
 * would reach `buildNetworkEvent` as raw, undecoded bytes — invisible to
 * key-based redaction, and the whole reason this module exists.
 */
export function decodeRequestBody(
  requestBody: RawRequestBody | undefined,
): unknown {
  if (!requestBody) return undefined;
  if (requestBody.formData) return requestBody.formData;
  if (requestBody.raw && requestBody.raw.length > 0) {
    const text = requestBody.raw
      .map((chunk) =>
        chunk.bytes ? new TextDecoder().decode(chunk.bytes) : "",
      )
      .join("");
    try {
      return JSON.parse(text);
    } catch {
      return redactRawBodyText(text);
    }
  }
  return undefined;
}
