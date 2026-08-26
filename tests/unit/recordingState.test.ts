import { describe, it, expect } from "vitest";
import {
  canStartRecording,
  summarizeRecording,
} from "../../src/lib/recordingState.js";

describe("canStartRecording", () => {
  it("is false when no PB is selected", () => {
    expect(canStartRecording(null)).toBe(false);
    expect(canStartRecording(undefined)).toBe(false);
    expect(canStartRecording("")).toBe(false);
  });

  it("is true once a PB id is selected", () => {
    expect(canStartRecording("pb-1")).toBe(true);
  });
});

describe("summarizeRecording", () => {
  it("formats the event count", () => {
    expect(summarizeRecording(0)).toBe("0 event terekam");
    expect(summarizeRecording(42)).toBe("42 event terekam");
  });
});
