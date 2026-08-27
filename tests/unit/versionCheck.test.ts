import { describe, it, expect } from "vitest";
import { assertVersionsMatch } from "../../scripts/lib/versionCheck.mjs";

describe("assertVersionsMatch", () => {
  it("returns the version when package.json and manifest.json agree", () => {
    expect(assertVersionsMatch("0.1.0", "0.1.0")).toBe("0.1.0");
  });

  it("throws when package.json and manifest.json versions differ", () => {
    expect(() => assertVersionsMatch("0.1.0", "0.2.0")).toThrow(/Version mismatch/);
  });
});
