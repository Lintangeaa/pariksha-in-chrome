import {
  login,
  fetchWorkspaces,
  fetchGroupPbs,
  fetchPbs,
  Pb,
} from "../lib/apiClient.js";
import { saveToken, loadToken } from "../lib/tokenStorage.js";
import {
  canStartRecording,
  summarizeRecording,
} from "../lib/recordingState.js";

// Inlined at build time by esbuild.config.mjs — see .env.example.
const BACKEND_URL = process.env.PARIKSHA_BACKEND_URL as string;

const loginView = document.getElementById("login-view") as HTMLDivElement;
const recordingView = document.getElementById(
  "recording-view",
) as HTMLDivElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const loginButton = document.getElementById(
  "login-button",
) as HTMLButtonElement;
const loginError = document.getElementById("login-error") as HTMLDivElement;
const workspaceSelect = document.getElementById(
  "workspace-select",
) as HTMLSelectElement;
const pbSelect = document.getElementById("pb-select") as HTMLSelectElement;
const startButton = document.getElementById(
  "start-button",
) as HTMLButtonElement;
const stopButton = document.getElementById("stop-button") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLDivElement;

let token: string | null = null;

function updateStartButton(): void {
  startButton.disabled = !canStartRecording(pbSelect.value);
}

function optionsHtml(items: { id: string; label: string }[]): string {
  return items
    .map((item) => `<option value="${item.id}">${item.label}</option>`)
    .join("");
}

async function loadPbsForWorkspace(workspaceId: string): Promise<void> {
  const groupPbs = await fetchGroupPbs(BACKEND_URL, token!, workspaceId);
  const pbs: Pb[] = [];
  for (const groupPb of groupPbs) {
    pbs.push(...(await fetchPbs(BACKEND_URL, token!, groupPb.id)));
  }
  pbSelect.innerHTML = optionsHtml(
    pbs.map((pb) => ({ id: pb.id, label: pb.title })),
  );
  updateStartButton();
}

async function syncRecordingStatus(): Promise<void> {
  // The popup is torn down and rebuilt from scratch every time it's
  // reopened (Chrome closes it on outside click/tab switch), but the
  // background service worker's recording state survives that — so on
  // open we must ask background what's actually happening instead of
  // defaulting to "not recording". Without this, a still-recording
  // session looks stopped, and clicking "Mulai Rekam" again would hit
  // START_RECORDING's buffer.clear() and destroy the events already
  // captured.
  // chrome.runtime.sendMessage can reject (e.g. the service worker is
  // mid-restart) — if that happens silently, the popup falls back to the
  // "not recording" default, which is exactly the bug this function
  // exists to prevent, just triggered by a transport error instead of a
  // missing call. Log it so a stale UI state is at least debuggable.
  let status: { recording?: boolean } | undefined;
  try {
    status = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
  } catch (err) {
    console.error("syncRecordingStatus: GET_STATUS failed", err);
    return;
  }
  if (status?.recording) {
    workspaceSelect.disabled = true;
    pbSelect.disabled = true;
    startButton.style.display = "none";
    stopButton.style.display = "block";
    statusEl.textContent = "Recording...";
  }
}

async function showRecordingView(): Promise<void> {
  loginView.style.display = "none";
  recordingView.style.display = "block";

  const workspaces = await fetchWorkspaces(BACKEND_URL, token!);
  workspaceSelect.innerHTML = optionsHtml(
    workspaces.map((w) => ({ id: w.id, label: w.name })),
  );
  if (workspaces[0]) await loadPbsForWorkspace(workspaces[0].id);
  await syncRecordingStatus();
}

workspaceSelect.addEventListener("change", () =>
  loadPbsForWorkspace(workspaceSelect.value),
);
pbSelect.addEventListener("change", updateStartButton);

loginButton.addEventListener("click", async () => {
  loginError.textContent = "";
  try {
    const result = await login(
      BACKEND_URL,
      emailInput.value,
      passwordInput.value,
    );
    token = result.token;
    await saveToken(token);
    await showRecordingView();
  } catch (err) {
    loginError.textContent =
      err instanceof Error ? err.message : "Login failed";
  }
});

startButton.addEventListener("click", () => {
  chrome.runtime
    .sendMessage({ type: "START_RECORDING", pbId: pbSelect.value })
    .then(() => {
      startButton.style.display = "none";
      stopButton.style.display = "block";
      statusEl.textContent = "Recording...";
    });
});

stopButton.addEventListener("click", () => {
  chrome.runtime
    .sendMessage({ type: "STOP_RECORDING" })
    .then((stopResponse) => {
      stopButton.style.display = "none";
      startButton.style.display = "block";
      statusEl.textContent = summarizeRecording(stopResponse?.eventCount ?? 0);

      chrome.runtime
        .sendMessage({ type: "UPLOAD_RECORDING" })
        .then((uploadResponse) => {
          statusEl.textContent += uploadResponse?.ok
            ? " — uploaded"
            : ` — upload failed: ${uploadResponse?.error}`;
        });
    });
});

void (async () => {
  token = await loadToken();
  if (token) await showRecordingView();
})();
