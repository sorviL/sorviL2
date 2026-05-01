import {
  type ValidationResult,
  getStringField,
  getOptionalStringField,
  getNumberField,
  getOptionalNumberField,
  getOptionalBooleanField,
  getArrayField,
  isValidObject
} from "../../shared/validation.js";
import type { AddBookInput, BookshelfQueryParams, FrontendShelfStatus, UpdateUserBookInput } from "./BookshelfTypes.js";
import { VALID_FRONTEND_STATUSES } from "./BookshelfTypes.js";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isValidFrontendStatus(value: string): value is FrontendShelfStatus {
  return (VALID_FRONTEND_STATUSES as string[]).includes(value);
}

export function validateAddBookInput(input: unknown): ValidationResult<AddBookInput> {
  const googleBooksIdResult = getStringField(input, "googleBooksId");
  if (!googleBooksIdResult.success) return googleBooksIdResult;

  const titleResult = getStringField(input, "title");
  if (!titleResult.success) return titleResult;

  const authorsResult = getArrayField(input, "authors", isString);
  if (!authorsResult.success) return authorsResult;

  const coverUrlResult = getOptionalStringField(input, "coverUrl");
  if (!coverUrlResult.success) return coverUrlResult;

  const pageCountResult = getNumberField(input, "pageCount");
  if (!pageCountResult.success) return pageCountResult;

  const statusResult = getStringField(input, "status");
  if (!statusResult.success) return statusResult;

  if (!isValidFrontendStatus(statusResult.data)) {
    return { success: false, message: `Status inválido: ${statusResult.data}.` };
  }

  return {
    success: true,
    data: {
      googleBooksId: googleBooksIdResult.data,
      title: titleResult.data,
      authors: authorsResult.data,
      coverUrl: coverUrlResult.data ?? null,
      pageCount: pageCountResult.data,
      status: statusResult.data
    },
  };
}

export function validateUpdateUserBookInput(input: unknown): ValidationResult<UpdateUserBookInput> {
  if (!isValidObject(input)) {
    return { success: false, message: "Corpo da requisição inválido." };
  }

  const statusResult = getOptionalStringField(input, "status");
  if (!statusResult.success) return statusResult;

  if (statusResult.data !== undefined && !isValidFrontendStatus(statusResult.data)) {
    return { success: false, message: `Status inválido: ${statusResult.data}.` };
  }

  const isFavoriteResult = getOptionalBooleanField(input, "isFavorite");
  if (!isFavoriteResult.success) return isFavoriteResult;

  const ratingResult = getOptionalNumberField(input, "rating");
  if (!ratingResult.success) return ratingResult;

  if (ratingResult.data !== undefined && (ratingResult.data < 0 || ratingResult.data > 5)) {
    return { success: false, message: "Rating deve ser entre 0 e 5." };
  }

  const currentPageResult = getOptionalNumberField(input, "currentPage");
  if (!currentPageResult.success) return currentPageResult;

  if (currentPageResult.data !== undefined && currentPageResult.data < 0) {
    return { success: false, message: "Página atual não pode ser negativa." };
  }

  const hasAnyField =
    statusResult.data !== undefined ||
    isFavoriteResult.data !== undefined ||
    ratingResult.data !== undefined ||
    currentPageResult.data !== undefined;

  if (!hasAnyField) {
    return { success: false, message: "Pelo menos um campo deve ser informado para atualização." };
  }

  return {
    success: true,
    data: {
      status: statusResult.data as FrontendShelfStatus | undefined,
      isFavorite: isFavoriteResult.data,
      rating: ratingResult.data,
      currentPage: currentPageResult.data
    },
  };
}

export function validateBookshelfQuery(query: unknown): ValidationResult<BookshelfQueryParams> {
  if (!isValidObject(query)) {
    return { success: true, data: { page: 1, limit: 20 } };
  }

  let page = 1;
  let limit = 20;

  if (query["page"] !== undefined) {
    const parsed = Number(query["page"]);
    if (Number.isNaN(parsed) || parsed < 1) {
      return { success: false, message: "Parâmetro page deve ser um número positivo." };
    }
    page = Math.floor(parsed);
  }

  if (query["limit"] !== undefined) {
    const parsed = Number(query["limit"]);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 1000) {
      return { success: false, message: "Parâmetro limit deve ser entre 1 e 1000." };
    }
    limit = Math.floor(parsed);
  }

  let status: FrontendShelfStatus | undefined;
  if (typeof query["status"] === "string" && query["status"]) {
    if (!isValidFrontendStatus(query["status"])) {
      return { success: false, message: `Status inválido: ${query["status"]}.` };
    }
    status = query["status"];
  }

  let filter: "favorites" | "reviews" | undefined;
  if (typeof query["filter"] === "string" && query["filter"]) {
    if (query["filter"] !== "favorites" && query["filter"] !== "reviews") {
      return { success: false, message: `Filtro inválido: ${query["filter"]}.` };
    }
    filter = query["filter"];
  }

  return {
    success: true,
    data: { page, limit, status, filter }
  };
}
