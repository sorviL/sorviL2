const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

type ToggleResult = { liked: boolean; likeCount: number };

async function safeFetch(input: RequestInfo | URL, init: RequestInit): Promise<Response | null> {
  try {
    const url = typeof input === "string"
      ? `${input}${input.includes("?") ? "&" : "?"}_t=${Date.now()}`
      : input;
    return await fetch(url, { ...init, cache: "no-store" });
  } catch {
    return null;
  }
}

export async function toggleReviewLike(reviewId: string | number): Promise<ApiResponse<ToggleResult>> {
  const response = await safeFetch(`${API_BASE_URL}/likes/review/${reviewId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  if (!response.ok) {
    return { success: false, error: "Erro ao curtir resenha." };
  }

  const body = await response.json();
  return { success: true, data: body as ToggleResult };
}

export async function toggleUpdateLike(updateId: string | number): Promise<ApiResponse<ToggleResult>> {
  const response = await safeFetch(`${API_BASE_URL}/likes/update/${updateId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  if (!response.ok) {
    return { success: false, error: "Erro ao curtir atualização." };
  }

  const body = await response.json();
  return { success: true, data: body as ToggleResult };
}
