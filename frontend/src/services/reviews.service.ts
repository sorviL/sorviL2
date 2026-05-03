import type { ShelfStatus } from "../types/bookshelf";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

type ErrorResponse = {
  readonly message: string;
};

export type CreateReviewBookPayload = {
  readonly googleBooksId: string;
  readonly title: string;
  readonly authors: string[];
  readonly coverUrl?: string | null | undefined;
  readonly pageCount?: number | null | undefined;
};

export type CreateReviewPayload = {
  readonly book: CreateReviewBookPayload;
  readonly category: ShelfStatus;
  readonly rating?: number;
  readonly content?: string;
  readonly hasSpoiler?: boolean;
};

export type CreatedReview = {
  readonly reviewId?: number | null;
  readonly bookId: string;
  readonly category: ShelfStatus;
  readonly rating?: number | null;
  readonly content?: string | null;
  readonly hasSpoiler?: boolean;
  readonly createdAt?: string | null;
};



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

export async function createReview(payload: CreateReviewPayload): Promise<ApiResponse<CreatedReview | null>> {
  const response = await safeFetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include"
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<{ review: CreatedReview | null }>(response).then((result) => {
    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data.review };
  });
}
