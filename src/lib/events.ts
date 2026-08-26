import { HttpHeader } from "./redact.js";

export interface NetworkEvent {
  type: "network";
  timestamp: number;
  url: string;
  method: string;
  status: number;
  requestHeaders: HttpHeader[];
  responseHeaders: HttpHeader[];
  requestBody?: unknown;
}

export interface ConsoleEvent {
  type: "console";
  timestamp: number;
  level: "log" | "warn" | "error";
  message: string;
}

export type InteractionKind = "click" | "input" | "navigate";

export interface InteractionEvent {
  type: "click";
  kind: InteractionKind;
  timestamp: number;
  selector: string;
  value?: string;
  url?: string;
}

export type RecordedEvent = NetworkEvent | ConsoleEvent | InteractionEvent;
