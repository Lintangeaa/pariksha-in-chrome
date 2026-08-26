import { RecordedEvent } from "./events.js";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || response.statusText;
  } catch {
    return response.statusText;
  }
}

export interface Workspace {
  id: string;
  name: string;
}

export interface GroupPb {
  id: string;
  name: string;
}

export interface Pb {
  id: string;
  title: string;
}

export interface LoginResult {
  token: string;
  user: { id: string; email: string };
}

export async function login(
  baseUrl: string,
  email: string,
  password: string,
): Promise<LoginResult> {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }
  return response.json() as Promise<LoginResult>;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchWorkspaces(
  baseUrl: string,
  token: string,
): Promise<Workspace[]> {
  const response = await fetch(`${baseUrl}/workspaces`, {
    headers: authHeaders(token),
  });
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }
  const body = (await response.json()) as { workspaces: Workspace[] };
  return body.workspaces;
}

export async function fetchGroupPbs(
  baseUrl: string,
  token: string,
  workspaceId: string,
): Promise<GroupPb[]> {
  const response = await fetch(
    `${baseUrl}/workspaces/${workspaceId}/group-pbs`,
    {
      headers: authHeaders(token),
    },
  );
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }
  const body = (await response.json()) as { group_pbs: GroupPb[] };
  return body.group_pbs;
}

export async function fetchPbs(
  baseUrl: string,
  token: string,
  groupPbId: string,
): Promise<Pb[]> {
  const response = await fetch(`${baseUrl}/group-pbs/${groupPbId}/pbs`, {
    headers: authHeaders(token),
  });
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }
  const body = (await response.json()) as { pbs: Pb[] };
  return body.pbs;
}

export interface UploadRecordedSessionInput {
  startedAt: string;
  finishedAt: string;
  events: RecordedEvent[];
}

export interface RecordedSession {
  id: string;
  pb_id: string;
  event_count: number;
}

export async function uploadRecordedSession(
  baseUrl: string,
  token: string,
  pbId: string,
  input: UploadRecordedSessionInput,
): Promise<RecordedSession> {
  const response = await fetch(`${baseUrl}/pbs/${pbId}/recorded-sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({
      started_at: input.startedAt,
      finished_at: input.finishedAt,
      events: input.events,
    }),
  });
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }
  const body = (await response.json()) as { recorded_session: RecordedSession };
  return body.recorded_session;
}
