import { getAccessToken } from "@/lib/auth";

export const API_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api/v1",
).replace(/\/$/, "");

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const token = getAccessToken();

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
