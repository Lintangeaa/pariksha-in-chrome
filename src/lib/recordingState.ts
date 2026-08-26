/** "Mulai Rekam" is only enabled once a PB has actually been selected — no recording without an owner. */
export function canStartRecording(pbId: string | null | undefined): boolean {
  return typeof pbId === "string" && pbId.length > 0;
}

/** Human-readable summary shown after "Stop", before the batch is uploaded. */
export function summarizeRecording(eventCount: number): string {
  return `${eventCount} event terekam`;
}
