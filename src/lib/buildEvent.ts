import {
  HttpHeader,
  redactHeaders,
  redactSensitiveKeys,
  redactUrlQueryParams,
  redactFormFieldValue,
} from "./redact.js";
import {
  NetworkEvent,
  ConsoleEvent,
  InteractionEvent,
  InteractionKind,
} from "./events.js";

export interface BuildNetworkEventInput {
  timestamp: number;
  url: string;
  method: string;
  statusCode: number;
  requestHeaders: HttpHeader[];
  responseHeaders: HttpHeader[];
  requestBody?: unknown;
}

/** Builds a structured, already-redacted network event — redaction happens here, not at upload time. */
export function buildNetworkEvent(input: BuildNetworkEventInput): NetworkEvent {
  return {
    type: "network",
    timestamp: input.timestamp,
    url: redactUrlQueryParams(input.url),
    method: input.method,
    status: input.statusCode,
    requestHeaders: redactHeaders(input.requestHeaders),
    responseHeaders: redactHeaders(input.responseHeaders),
    ...(input.requestBody !== undefined && {
      requestBody: redactSensitiveKeys(input.requestBody),
    }),
  };
}

export interface BuildConsoleEventInput {
  timestamp: number;
  level: "log" | "warn" | "error";
  message: string;
}

export function buildConsoleEvent(input: BuildConsoleEventInput): ConsoleEvent {
  return {
    type: "console",
    timestamp: input.timestamp,
    level: input.level,
    message: input.message,
  };
}

export interface BuildInteractionEventInput {
  timestamp: number;
  kind: InteractionKind;
  selector: string;
  value?: string;
  fieldType?: string;
  url?: string;
}

/** Builds a structured, already-redacted click/input/navigate event. */
export function buildInteractionEvent(
  input: BuildInteractionEventInput,
): InteractionEvent {
  const value =
    input.value !== undefined && input.fieldType !== undefined
      ? redactFormFieldValue(input.fieldType, input.value)
      : input.value;

  return {
    type: "click",
    kind: input.kind,
    timestamp: input.timestamp,
    selector: input.selector,
    ...(value !== undefined && { value }),
    ...(input.url !== undefined && { url: input.url }),
  };
}
