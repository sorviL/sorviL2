import type { PublicUser } from "./auth.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = (body as { message?: string } | null)?.message || "Erro na requisição.";
    return { success: false, error: errorMessage };
  }

  return { success: true, data: body as T };
}

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

export async function getProfile(): Promise<{ success: true; data: PublicUser } | { success: false; error: string }> {
  const response = await safeFetch(`${API_BASE_URL}/profile/me`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response) return { success: false, error: "Nao foi possivel conectar ao servidor." };

  const result = await handleApiResponse<{ user: PublicUser }>(response);

  if (!result.success) return { success: false, error: result.error };

  return { success: true, data: result.data.user };
}

export async function updateProfile(payload: Record<string, unknown>): Promise<{ success: true; data: PublicUser } | { success: false; error?: string }> {
  const response = await safeFetch(`${API_BASE_URL}/profile/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response) return { success: false, error: "Nao foi possivel conectar ao servidor." };

  const result = await handleApiResponse<{ user: PublicUser }>(response);

  if (!result.success) return { success: false, error: result.error };

  return { success: true, data: result.data.user };
}

export async function uploadAvatar(file: File): Promise<{ success: true; data: PublicUser } | { success: false; error: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await safeFetch(`${API_BASE_URL}/profile/avatar`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response) return { success: false, error: "Nao foi possivel conectar ao servidor." };

  const result = await handleApiResponse<{ user: PublicUser }>(response);

  if (!result.success) return { success: false, error: result.error };

  return { success: true, data: result.data.user };
}

export type RecentProfileBook = {
  readonly userBookId: number;
  readonly bookId: string;
  readonly bookTitle: string;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly createdAt: string;
};

export type RecentProfileBooksResponse = {
  readonly books: RecentProfileBook[];
  readonly total: number;
};

export type RecentProfileReview = {
  readonly reviewId: number;
  readonly bookId: string;
  readonly bookTitle: string;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly rating: number;
  readonly content: string;
  readonly createdAt: string;
};

export type RecentProfileReviewsResponse = {
  readonly reviews: RecentProfileReview[];
  readonly total: number;
};

export async function getRecentProfileBooks(limit = 5): Promise<{ success: true; data: RecentProfileBooksResponse } | { success: false; error: string }> {
  const response = await safeFetch(`${API_BASE_URL}/profile/me/recent-books?limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response) return { success: false, error: "Nao foi possivel conectar ao servidor." };

  const result = await handleApiResponse<RecentProfileBooksResponse>(response);

  if (!result.success) return { success: false, error: result.error };

  return { success: true, data: result.data };
}

export async function getRecentProfileReviews(limit = 5): Promise<{ success: true; data: RecentProfileReviewsResponse } | { success: false; error: string }> {
  const response = await safeFetch(`${API_BASE_URL}/profile/me/recent-reviews?limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response) return { success: false, error: "Nao foi possivel conectar ao servidor." };

  const result = await handleApiResponse<RecentProfileReviewsResponse>(response);

  if (!result.success) return { success: false, error: result.error };

  return { success: true, data: result.data };
}
