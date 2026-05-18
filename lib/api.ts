import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("token")?.value || null;
  } catch {
    // Client-side: token will be sent via cookie automatically
    return null;
  }
}

async function getUserTimezone(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("USER_TIMEZONE")?.value || null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();
  const timezone = await getUserTimezone();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (timezone) {
    headers["x-timezone"] = timezone;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed?.message) errorMessage = parsed.message;
      } catch {
        // body is not JSON — keep the default message
      }
    }
    throw new Error(errorMessage);
  }

  if (!text) {
    return undefined as T;
  }

  const json = JSON.parse(text);
  return json.data !== undefined ? json.data : json;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET" });
}

export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T>(
  endpoint: string,
  body?: unknown,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE" });
}
