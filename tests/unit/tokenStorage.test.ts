import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveToken,
  loadToken,
  clearToken,
} from "../../src/lib/tokenStorage.js";

function fakeChrome() {
  return {
    storage: {
      local: {
        set: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue({}),
        remove: vi.fn().mockResolvedValue(undefined),
      },
    },
  };
}

describe("tokenStorage", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("saveToken writes to chrome.storage.local under a fixed key", async () => {
    const chromeMock = fakeChrome();
    vi.stubGlobal("chrome", chromeMock);

    await saveToken("tok-1");

    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
      pariksha_token: "tok-1",
    });
  });

  it("loadToken returns the stored token when present", async () => {
    const chromeMock = fakeChrome();
    chromeMock.storage.local.get.mockResolvedValue({ pariksha_token: "tok-1" });
    vi.stubGlobal("chrome", chromeMock);

    expect(await loadToken()).toBe("tok-1");
  });

  it("loadToken returns null when nothing is stored", async () => {
    const chromeMock = fakeChrome();
    vi.stubGlobal("chrome", chromeMock);

    expect(await loadToken()).toBe(null);
  });

  it("clearToken removes the stored key", async () => {
    const chromeMock = fakeChrome();
    vi.stubGlobal("chrome", chromeMock);

    await clearToken();

    expect(chromeMock.storage.local.remove).toHaveBeenCalledWith(
      "pariksha_token",
    );
  });
});
