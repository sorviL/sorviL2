import type { BookshelfFilter } from "../types/bookshelf";
import type { BookshelfListResponse, BookshelfLookupResponse, ErrorResponse } from "./bookshelf.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

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
    return await fetch(input, { ...init, cache: "no-store" });
  } catch {
    return null;
  }
}

function buildBookshelfQueryString(activeFilter: BookshelfFilter | null): string {
  const params = new URLSearchParams();
  params.set("limit", "1000");

  if (!activeFilter) return params.toString();

  if (activeFilter === "favorites" || activeFilter === "reviews" || activeFilter === "updates") {
    params.set("filter", activeFilter);
  } else {
    params.set("status", activeFilter);
  }

  return params.toString();
}

export async function fetchBookshelf(activeFilter: BookshelfFilter | null): Promise<ApiResponse<BookshelfListResponse>> {
  const queryString = buildBookshelfQueryString(activeFilter);

  const response = await safeFetch(`${API_BASE_URL}/bookshelf?${queryString}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<BookshelfListResponse>(response);
}

export async function removeBookFromShelf(userBookId: number): Promise<ApiResponse<null>> {
  const response = await safeFetch(`${API_BASE_URL}/bookshelf/${userBookId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<null>(response);
}

export async function updateBookshelf(
  userBookId: number,
  data: { isFavorite?: boolean }
): Promise<ApiResponse<null>> {
  const response = await safeFetch(`${API_BASE_URL}/bookshelf/${userBookId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<null>(response);
}

export async function fetchBookStatus(bookId: string): Promise<ApiResponse<BookshelfLookupResponse>> {
  const response = await safeFetch(`${API_BASE_URL}/bookshelf/lookup?bookId=${encodeURIComponent(bookId)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<BookshelfLookupResponse>(response);
}
