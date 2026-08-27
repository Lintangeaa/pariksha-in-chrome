import { useEffect, useState } from "preact/hooks";
import {
  login,
  fetchWorkspaces,
  fetchGroupPbs,
  fetchPbs,
  Workspace,
  Pb,
} from "../../lib/apiClient.js";
import { saveToken, loadToken } from "../../lib/tokenStorage.js";
import { summarizeRecording } from "../../lib/recordingState.js";
import { RecordedEvent } from "../../lib/events.js";
import { FloatingButton } from "./FloatingButton.js";
import { EventPanel } from "./EventPanel.js";
import { SetupForm } from "./SetupForm.js";

// Inlined at build time by esbuild.config.mjs — see .env.example.
const BACKEND_URL = process.env.PARIKSHA_BACKEND_URL as string;

/** Top-level state machine for the floating button + panel, mounted once per page by mount.ts. */
export function PanelRoot() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [events, setEvents] = useState<RecordedEvent[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [pbs, setPbs] = useState<Pb[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedPbId, setSelectedPbId] = useState("");

  useEffect(() => {
    loadToken().then((stored) => {
      if (stored) setToken(stored);
    });
    chrome.runtime.sendMessage({ type: "GET_STATUS" }).then((response) => {
      if (response?.recording) setRecording(true);
    });

    const listener = (message: { type?: string; event?: RecordedEvent }) => {
      if (message?.type === "TOGGLE_PANEL") setOpen((o) => !o);
      if (message?.type === "START_RECORDING") {
        setRecording(true);
        setEvents([]);
      }
      if (message?.type === "STOP_RECORDING") setRecording(false);
      if (message?.type === "RECORDED_EVENT" && message.event) {
        setEvents((prev) => [...prev, message.event as RecordedEvent]);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchWorkspaces(BACKEND_URL, token).then((ws) => {
      setWorkspaces(ws);
      if (ws[0]) setSelectedWorkspaceId(ws[0].id);
    });
  }, [token]);

  useEffect(() => {
    if (!token || !selectedWorkspaceId) return;
    (async () => {
      const groupPbs = await fetchGroupPbs(BACKEND_URL, token, selectedWorkspaceId);
      const allPbs: Pb[] = [];
      for (const groupPb of groupPbs) {
        allPbs.push(...(await fetchPbs(BACKEND_URL, token, groupPb.id)));
      }
      setPbs(allPbs);
      setSelectedPbId(allPbs[0]?.id ?? "");
    })();
  }, [token, selectedWorkspaceId]);

  async function handleLogin(email: string, password: string) {
    setLoginError(null);
    try {
      const result = await login(BACKEND_URL, email, password);
      await saveToken(result.token);
      setToken(result.token);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    }
  }

  async function handleStart() {
    await chrome.runtime.sendMessage({
      type: "START_RECORDING",
      pbId: selectedPbId,
    });
    setRecording(true);
    setEvents([]);
    setStatus("Recording...");
  }

  async function handleStop() {
    const stopResponse = await chrome.runtime.sendMessage({ type: "STOP_RECORDING" });
    setRecording(false);
    const summary = summarizeRecording(stopResponse?.eventCount ?? 0);
    setStatus(summary);

    const uploadResponse = await chrome.runtime.sendMessage({ type: "UPLOAD_RECORDING" });
    setStatus(
      `${summary} — ${uploadResponse?.ok ? "uploaded" : `upload failed: ${uploadResponse?.error}`}`,
    );
  }

  return (
    <>
      <FloatingButton recording={recording} onClick={() => setOpen((o) => !o)} />
      {open && (
        <EventPanel recording={recording} events={events} onClose={() => setOpen(false)}>
          <SetupForm
            loggedIn={!!token}
            recording={recording}
            loginError={loginError}
            status={status}
            workspaces={workspaces}
            pbs={pbs}
            selectedWorkspaceId={selectedWorkspaceId}
            selectedPbId={selectedPbId}
            onLogin={handleLogin}
            onWorkspaceChange={setSelectedWorkspaceId}
            onPbChange={setSelectedPbId}
            onStart={handleStart}
            onStop={handleStop}
          />
        </EventPanel>
      )}
    </>
  );
}
