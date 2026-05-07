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
  readonly reviewId?: number | null;
  readonly readingStartDate?: string;
  readonly readingEndDate?: string;
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
    return await fetch(input, { ...init, cache: "no-store" });
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

export async function deleteReview(reviewId: number): Promise<ApiResponse<null>> {
  const response = await safeFetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<null>(response);
}

export async function fetchUserReview(googleBooksId: string): Promise<ApiResponse<{ id: number; rating: number | null; content: string | null; hasSpoiler: boolean; createdAt: string | null } | null>> {
  const response = await safeFetch(`${API_BASE_URL}/reviews/book/${encodeURIComponent(googleBooksId)}`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response) {
    return { success: false, error: 'Não foi possível conectar ao servidor.' };
  }

  return handleApiResponse<{ review: { id: number; rating: number | null; content: string | null; hasSpoiler: boolean; createdAt: string | null } | null }>(response).then((result) => {
    if (!result.success) return result;
    return { success: true, data: result.data.review };
  });
}

export type ReviewData = {
  readonly id: string;
  readonly userId?: number;
  readonly author: string;
  readonly authorAvatar?: string | null;
  readonly rating: number;
  readonly text: string | null;
  readonly date?: string;
  readonly isSpoiler?: boolean;
  readonly bookTitle?: string | null;
  readonly coverUrl?: string | null;
  readonly googleBooksId?: string | null;
  readonly bookAuthors?: string[];
  readonly bookPageCount?: number | null;
  readonly currentPage?: number | null;
  readonly percentage?: number | null;
  readonly reaction?: string | null;
};

function parseAuthors(authors: unknown): string[] {
  if (Array.isArray(authors)) {
    return authors.filter((item): item is string => typeof item === "string");
  }

  if (typeof authors === "string") {
    try {
      const parsed = JSON.parse(authors);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return [];
    }
  }

  return [];
}

export async function fetchAllReviews(page: number = 1, pageSize: number = 50): Promise<ApiResponse<ReviewData[]>> {
  const response = await safeFetch(`${API_BASE_URL}/reviews/all?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });

  if (!response) {
    return { success: false, error: 'Não foi possível conectar ao servidor.' };
  }

  return handleApiResponse<any>(response).then((result) => {
    if (!result.success) return result;
    const items = result.data.data?.items || [];
    const reviews: ReviewData[] = items.map((r: any) => ({
      id: String(r.id),
      userId: typeof r.user_id === "number" ? r.user_id : undefined,
      author: r.author_name || "Anônimo",
      authorAvatar: r.author_avatar,
      rating: r.rating || 0,
      text: r.content,
      date: r.created_at,
      isSpoiler: !!r.has_spoiler,
      bookTitle: r.book_title,
      coverUrl: r.cover_url,
      googleBooksId: r.google_books_id,
      bookAuthors: parseAuthors(r.book_authors),
      bookPageCount: r.book_page_count ?? null,
    }));
    return { success: true, data: reviews };
  });
}

export async function fetchRecentReviews(userId?: number, bookId?: number, limit: number = 10): Promise<ApiResponse<ReviewData[]>> {
  const params = new URLSearchParams();
  if (userId) params.append("userId", String(userId));
  if (bookId) params.append("bookId", String(bookId));
  if (limit) params.append("limit", String(limit));

  const response = await safeFetch(`${API_BASE_URL}/reviews/recent?${params}`, {
    method: 'GET',
  });

  if (!response) {
    return { success: false, error: 'Não foi possível conectar ao servidor.' };
  }

  return handleApiResponse<any>(response).then((result) => {
    if (!result.success) return result;
    const items = result.data.data || [];
    const reviews: ReviewData[] = items.map((r: any) => ({
      id: String(r.id),
      userId: typeof r.user_id === "number" ? r.user_id : undefined,
      author: r.author_name || "Anônimo",
      authorAvatar: r.author_avatar,
      rating: r.rating || 0,
      text: r.content,
      date: r.created_at,
      isSpoiler: !!r.has_spoiler,
      bookTitle: r.book_title,
      coverUrl: r.cover_url,
      googleBooksId: r.google_books_id,
      bookAuthors: parseAuthors(r.book_authors),
      bookPageCount: r.book_page_count ?? null,
    }));
    return { success: true, data: reviews };
  });
}

export async function fetchBookReviews(bookId: number, order: "date" | "rating" = "date"): Promise<ApiResponse<ReviewData[]>> {
  const response = await safeFetch(`${API_BASE_URL}/reviews/by-book/${bookId}?order=${order}`, {
    method: 'GET',
  });

  if (!response) {
    return { success: false, error: 'Não foi possível conectar ao servidor.' };
  }

  return handleApiResponse<any>(response).then((result) => {
    if (!result.success) return result;
    const items = result.data.data || [];
    const reviews: ReviewData[] = items.map((r: any) => ({
      id: String(r.id),
      userId: typeof r.user_id === "number" ? r.user_id : undefined,
      author: r.author_name || "Anônimo",
      authorAvatar: r.author_avatar,
      rating: r.rating || 0,
      text: r.content,
      date: r.created_at,
      isSpoiler: !!r.has_spoiler,
      bookTitle: r.book_title,
      coverUrl: r.cover_url,
      googleBooksId: r.google_books_id,
      bookAuthors: parseAuthors(r.book_authors),
      bookPageCount: r.book_page_count ?? null,
    }));
    return { success: true, data: reviews };
  });
}

export async function getById(id: number): Promise<ApiResponse<ReviewData | null>> {
  const response = await safeFetch(`${API_BASE_URL}/reviews/${id}`, {
    method: 'GET',
  });

  if (!response) {
    return { success: false, error: 'Não foi possível conectar ao servidor.' };
  }

  return handleApiResponse<any>(response).then((result) => {
    if (!result.success) return result;
    const r = result.data.data;
    if (!r) return { success: true, data: null };
    const review: ReviewData = {
      id: String(r.id),
      userId: typeof r.user_id === "number" ? r.user_id : undefined,
      author: r.author_name || "Anônimo",
      authorAvatar: r.author_avatar,
      rating: r.rating || 0,
      text: r.content,
      date: r.created_at,
      isSpoiler: !!r.has_spoiler,
      bookTitle: r.book_title,
      coverUrl: r.cover_url,
      googleBooksId: r.google_books_id,
      bookAuthors: parseAuthors(r.book_authors),
      bookPageCount: r.book_page_count ?? null,
    };
    return { success: true, data: review };
  });
}
