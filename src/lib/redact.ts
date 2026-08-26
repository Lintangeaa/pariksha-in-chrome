export const REDACTED = "[REDACTED]";

const SENSITIVE_HEADER_NAMES = new Set([
  "authorization",
  "cookie",
  "set-cookie",
]);

const SENSITIVE_KEY_PATTERN = /(token|api[_-]?key|secret|password|passwd)/i;

export interface HttpHeader {
  name: string;
  value?: string;
}

/** Masks the value of any header whose name is Authorization/Cookie/Set-Cookie (case-insensitive). */
export function redactHeaders(headers: HttpHeader[]): HttpHeader[] {
  return headers.map((header) =>
    SENSITIVE_HEADER_NAMES.has(header.name.toLowerCase())
      ? { ...header, value: REDACTED }
      : header,
  );
}

/**
 * Recursively masks any value in a plain object/array whose key matches a
 * sensitive pattern (`token`, `api_key`, `secret`, `password`, ...), or
 * whose own value is a `type="password"` form field description
 * (`{ type: "password", value: ... }`, see `redactFormFieldValue`).
 * Non-plain-object values (primitives) are returned unchanged.
 */
export function redactSensitiveKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveKeys(item));
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? REDACTED
        : redactSensitiveKeys(val);
    }
    return result;
  }
  return value;
}

/**
 * Best-effort redaction for a raw (non-JSON-parseable) request body string —
 * used when a network request's body couldn't be decoded into a plain
 * object (see `decodeRequestBody`), so the structured, key-aware
 * `redactSensitiveKeys` can't run. Scrubs `key=value` (URL-encoded form
 * body) and `"key":"value"` (malformed/partial JSON) pairs whose key
 * matches the sensitive pattern. Not a substitute for structured
 * redaction — only a fallback so an undecodable body still gets *some*
 * protection rather than none.
 */
export function redactRawBodyText(text: string): string {
  return text
    .replace(
      /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
      (match, key: string) =>
        SENSITIVE_KEY_PATTERN.test(key) ? `"${key}":"${REDACTED}"` : match,
    )
    .replace(
      /([?&]?)([a-zA-Z0-9_-]+)=([^&]*)/g,
      (match, prefix: string, key: string) =>
        SENSITIVE_KEY_PATTERN.test(key) ? `${prefix}${key}=${REDACTED}` : match,
    );
}

/** Masks a form field's captured value when the field is `type="password"`. */
export function redactFormFieldValue(fieldType: string, value: string): string {
  return fieldType.toLowerCase() === "password" ? REDACTED : value;
}

/** Masks sensitive query-string parameter values in a URL, keeping the rest of the URL intact. */
export function redactUrlQueryParams(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Not a parseable absolute URL (e.g. a relative path slipped through) — nothing to redact safely.
    return url;
  }

  for (const key of [...parsed.searchParams.keys()]) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      parsed.searchParams.set(key, REDACTED);
    }
  }
  return parsed.toString();
}
