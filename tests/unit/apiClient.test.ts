import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  login,
  fetchWorkspaces,
  fetchGroupPbs,
  fetchPbs,
  uploadRecordedSession,
  ApiError,
} from "../../src/lib/apiClient.js";

const BASE_URL = "https://backend.example.com";

describe("apiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("login", () => {
    it("posts credentials and returns the token + user", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: "tok-1",
          user: { id: "u-1", email: "a@b.com" },
        }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await login(BASE_URL, "a@b.com", "secret");

      expect(result).toEqual({
        token: "tok-1",
        user: { id: "u-1", email: "a@b.com" },
      });
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/auth/login`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "a@b.com", password: "secret" }),
        }),
      );
      vi.unstubAllGlobals();
    });

    it("throws ApiError with the backend's error message on a non-2xx response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
          json: async () => ({ error: "Invalid email or password" }),
        }),
      );

      await expect(login(BASE_URL, "a@b.com", "wrong")).rejects.toThrow(
        "Invalid email or password",
      );
      vi.unstubAllGlobals();
    });
  });

  describe("fetchWorkspaces / fetchGroupPbs / fetchPbs", () => {
    it("fetches workspaces with the bearer token and unwraps the list", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ workspaces: [{ id: "ws-1", name: "Acme" }] }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await fetchWorkspaces(BASE_URL, "tok-1");

      expect(result).toEqual([{ id: "ws-1", name: "Acme" }]);
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/workspaces`,
        expect.objectContaining({ headers: { Authorization: "Bearer tok-1" } }),
      );
      vi.unstubAllGlobals();
    });

    it("fetches group PBs scoped to a workspace", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ group_pbs: [{ id: "gpb-1", name: "Sprint 1" }] }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await fetchGroupPbs(BASE_URL, "tok-1", "ws-1");

      expect(result).toEqual([{ id: "gpb-1", name: "Sprint 1" }]);
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/workspaces/ws-1/group-pbs`,
        expect.anything(),
      );
      vi.unstubAllGlobals();
    });

    it("fetches PBs scoped to a group PB", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ pbs: [{ id: "pb-1", title: "Login flow" }] }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await fetchPbs(BASE_URL, "tok-1", "gpb-1");

      expect(result).toEqual([{ id: "pb-1", title: "Login flow" }]);
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/group-pbs/gpb-1/pbs`,
        expect.anything(),
      );
      vi.unstubAllGlobals();
    });
  });

  describe("uploadRecordedSession", () => {
    it("posts the event batch and metadata, returning the created RecordedSession", async () => {
      const events = [
        {
          type: "click" as const,
          kind: "click" as const,
          timestamp: 1,
          selector: "#a",
        },
      ];
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          recorded_session: { id: "rs-1", pb_id: "pb-1", event_count: 1 },
        }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await uploadRecordedSession(BASE_URL, "tok-1", "pb-1", {
        startedAt: "2026-08-27T00:00:00.000Z",
        finishedAt: "2026-08-27T00:05:00.000Z",
        events,
      });

      expect(result).toEqual({ id: "rs-1", pb_id: "pb-1", event_count: 1 });
      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/pbs/pb-1/recorded-sessions`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            started_at: "2026-08-27T00:00:00.000Z",
            finished_at: "2026-08-27T00:05:00.000Z",
            events,
          }),
        }),
      );
      vi.unstubAllGlobals();
    });

    it("throws ApiError when the upload fails", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          statusText: "Bad Request",
          json: async () => ({ error: "At least 1 event is required" }),
        }),
      );

      await expect(
        uploadRecordedSession(BASE_URL, "tok-1", "pb-1", {
          startedAt: "2026-08-27T00:00:00.000Z",
          finishedAt: "2026-08-27T00:05:00.000Z",
          events: [],
        }),
      ).rejects.toThrow(ApiError);
      vi.unstubAllGlobals();
    });
  });
});
