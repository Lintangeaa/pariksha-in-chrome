import { useState } from "preact/hooks";
import type { Workspace, Pb } from "../../lib/apiClient.js";
import { canStartRecording } from "../../lib/recordingState.js";

export interface SetupFormProps {
  loggedIn: boolean;
  recording: boolean;
  loginError: string | null;
  status: string | null;
  workspaces: Workspace[];
  pbs: Pb[];
  selectedWorkspaceId: string;
  selectedPbId: string;
  onLogin: (email: string, password: string) => void;
  onWorkspaceChange: (workspaceId: string) => void;
  onPbChange: (pbId: string) => void;
  onStart: () => void;
  onStop: () => void;
}

/** Login + Workspace/PB pickers + Start/Stop controls — the home the old popup UI moved into. */
export function SetupForm({
  loggedIn,
  recording,
  loginError,
  status,
  workspaces,
  pbs,
  selectedWorkspaceId,
  selectedPbId,
  onLogin,
  onWorkspaceChange,
  onPbChange,
  onStart,
  onStop,
}: SetupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!loggedIn) {
    return (
      <div>
        <label class="pariksha-field" for="pariksha-email">
          Email
        </label>
        <input
          id="pariksha-email"
          class="pariksha-input"
          type="email"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
        />
        <label class="pariksha-field" for="pariksha-password">
          Password
        </label>
        <input
          id="pariksha-password"
          class="pariksha-input"
          type="password"
          value={password}
          onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
        />
        <button type="button" class="pariksha-btn" onClick={() => onLogin(email, password)}>
          Login
        </button>
        {loginError && <p class="pariksha-error">{loginError}</p>}
      </div>
    );
  }

  if (recording) {
    return (
      <div>
        <button type="button" class="pariksha-btn danger" onClick={onStop}>
          Stop Recording
        </button>
        {status && <p class="pariksha-status">{status}</p>}
      </div>
    );
  }

  return (
    <div>
      <label class="pariksha-field" for="pariksha-workspace">
        Workspace
      </label>
      <select
        id="pariksha-workspace"
        class="pariksha-select"
        value={selectedWorkspaceId}
        onChange={(e) => onWorkspaceChange((e.target as HTMLSelectElement).value)}
      >
        {workspaces.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <label class="pariksha-field" for="pariksha-pb">
        PB
      </label>
      <select
        id="pariksha-pb"
        class="pariksha-select"
        value={selectedPbId}
        onChange={(e) => onPbChange((e.target as HTMLSelectElement).value)}
      >
        {pbs.map((pb) => (
          <option key={pb.id} value={pb.id}>
            {pb.title}
          </option>
        ))}
      </select>
      <button
        type="button"
        class="pariksha-btn"
        disabled={!canStartRecording(selectedPbId)}
        onClick={onStart}
      >
        Mulai Rekam
      </button>
      {status && <p class="pariksha-status">{status}</p>}
    </div>
  );
}
