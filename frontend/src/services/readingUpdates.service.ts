const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

type ErrorResponse = { readonly message: string };

export type ReadingUpdateDto = {
  readonly id: number;
  readonly currentPage: number | null;
  readonly percentage: number | null;
  readonly comment: string | null;
  readonly reaction: string | null;
  readonly hasSpoiler: boolean;
  readonly createdAt: string;
};

export type ReadingUpdateWithBookDto = ReadingUpdateDto & {
  readonly googleBooksId: string;
  readonly bookTitle: string;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly bookPageCount: number | null;
  readonly likeCount: number;
  readonly isLiked: boolean;
};

export type CreateReadingUpdatePayload = {
  readonly googleBooksId: string;
  readonly currentPage?: number | null;
  readonly percentage?: number | null;
  readonly comment?: string | null;
  readonly reaction?: string | null;
  readonly hasSpoiler?: boolean;
};

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

async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = (body as ErrorResponse | null)?.message || "Erro na requisição.";
    return { success: false, error: errorMessage };
  }

  return { success: true, data: (body as { data: T }).data };
}

export async function createReadingUpdate(payload: CreateReadingUpdatePayload): Promise<ApiResponse<ReadingUpdateDto>> {
  const response = await safeFetch(`${API_BASE_URL}/reading-updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<ReadingUpdateDto>(response);
}

export type UpdateReadingUpdatePayload = {
  readonly currentPage?: number | null;
  readonly percentage?: number | null;
  readonly comment?: string | null;
  readonly reaction?: string | null;
  readonly hasSpoiler?: boolean;
};

export async function updateReadingUpdate(id: number, payload: UpdateReadingUpdatePayload): Promise<ApiResponse<ReadingUpdateDto>> {
  const response = await safeFetch(`${API_BASE_URL}/reading-updates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<ReadingUpdateDto>(response);
}

export async function fetchReadingUpdates(
  googleBooksId: string,
  page = 1,
  limit = 20,
): Promise<ApiResponse<{ items: ReadingUpdateDto[]; total: number }>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await safeFetch(
    `${API_BASE_URL}/reading-updates/book/${encodeURIComponent(googleBooksId)}?${params}`,
    { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
  );

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<{ items: ReadingUpdateDto[]; total: number }>(response);
}

export async function fetchLatestUpdate(googleBooksId: string): Promise<ApiResponse<ReadingUpdateDto | null>> {
  const response = await safeFetch(
    `${API_BASE_URL}/reading-updates/latest/${encodeURIComponent(googleBooksId)}`,
    { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
  );

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<ReadingUpdateDto | null>(response);
}

export async function fetchAllReadingUpdates(
  page = 1,
  limit = 50,
): Promise<ApiResponse<{ items: ReadingUpdateWithBookDto[]; total: number }>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await safeFetch(
    `${API_BASE_URL}/reading-updates/all?${params}`,
    { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
  );

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<{ items: ReadingUpdateWithBookDto[]; total: number }>(response);
}

export async function deleteReadingUpdate(id: number): Promise<ApiResponse<null>> {
  const response = await safeFetch(`${API_BASE_URL}/reading-updates/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response) {
    return { success: false, error: "Não foi possível conectar ao servidor." };
  }

  return handleApiResponse<null>(response);
}
