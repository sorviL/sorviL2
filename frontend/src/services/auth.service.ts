import type { AuthResponse, ErrorResponse, LoginPayload, PublicUser, RegisterPayload } from "./auth.types.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = (body as ErrorResponse | null)?.message || "Erro na requisição.";
    return { success: false, error: errorMessage };
  }

  return { success: true, data: body as T };
}

async function safeFetch(input: RequestInfo | URL, init: RequestInit): Promise<Response | null> {
  try {
    return await fetch(input, init);
  } catch {
    return null;
  }
}

export async function registerUser(payload: RegisterPayload): Promise<ApiResponse<PublicUser>> {
  const response = await safeFetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include"
  });

  if (!response) {
    return { success: false, error: "Nao foi possivel conectar ao servidor." };
  }

  return handleApiResponse<AuthResponse>(response).then((result) => {
    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data.user };
  });
}

export async function loginUser(payload: LoginPayload): Promise<ApiResponse<PublicUser>> {
  const response = await safeFetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include"
  });

  if (!response) {
    return { success: false, error: "Nao foi possivel conectar ao servidor." };
  }

  return handleApiResponse<AuthResponse>(response).then((result) => {
    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data.user };
  });
}

export async function getCurrentUser(): Promise<ApiResponse<PublicUser>> {
  const response = await safeFetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response) {
    return { success: false, error: "Nao foi possivel conectar ao servidor." };
  }

  return handleApiResponse<{ user: PublicUser }>(response).then((result) => {
    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data.user };
  });
}

export async function logoutUser(): Promise<ApiResponse<null>> {
  const response = await safeFetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response) {
    return { success: false, error: "Nao foi possivel conectar ao servidor." };
  }

  return handleApiResponse<null>(response).then((result) => {
    if (!result.success) {
      return result;
    }

    return { success: true, data: null };
  });
}
