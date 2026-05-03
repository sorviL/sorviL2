import {
  type ValidationResult,
  getArrayField,
  getNumberField,
  getOptionalBooleanField,
  getOptionalNumberField,
  getOptionalStringField,
  getStringField,
  isValidObject
} from "../../shared/validation.js";
import type {
  CreateReviewBookInput,
  CreateReviewInput
} from "./ReviewsTypes.js";
import { VALID_FRONTEND_STATUSES, type FrontendShelfStatus } from "../bookshelf/BookshelfTypes.js";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isValidFrontendStatus(value: string): value is FrontendShelfStatus {
  return (VALID_FRONTEND_STATUSES as string[]).includes(value);
}

function isValidIsoDate(value: string): boolean {
  // First check the format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  // Parse the date components
  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  // Create a date object and verify it matches the input
  // (if the date is invalid, the Date constructor will roll over)
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function validateReviewBookInput(input: unknown): ValidationResult<CreateReviewBookInput> {
  const googleBooksIdResult = getStringField(input, "googleBooksId");
  if (!googleBooksIdResult.success) return googleBooksIdResult;

  const titleResult = getStringField(input, "title");
  if (!titleResult.success) return titleResult;

  const authorsResult = getArrayField(input, "authors", isString);
  if (!authorsResult.success) return authorsResult;

  const coverUrlResult = getOptionalStringField(input, "coverUrl");
  if (!coverUrlResult.success) return coverUrlResult;

  const pageCountResult = getOptionalNumberField(input, "pageCount");
  if (!pageCountResult.success) return pageCountResult;

  if (pageCountResult.data !== undefined && pageCountResult.data < 0) {
    return { success: false, message: "Campo pageCount não pode ser negativo." };
  }

  return {
    success: true,
    data: {
      googleBooksId: googleBooksIdResult.data,
      title: titleResult.data,
      authors: authorsResult.data,
      coverUrl: coverUrlResult.data ?? null,
      pageCount: pageCountResult.data ?? null
    }
  };
}

export function validateCreateReviewInput(input: unknown): ValidationResult<CreateReviewInput> {
  if (!isValidObject(input)) {
    return { success: false, message: "Corpo da requisição inválido." };
  }

  const bookResult = validateReviewBookInput(input["book"]);
  if (!bookResult.success) return bookResult;

  const categoryResult = getStringField(input, "category");
  if (!categoryResult.success) return categoryResult;

  if (!isValidFrontendStatus(categoryResult.data)) {
    return { success: false, message: `Categoria inválida: ${categoryResult.data}.` };
  }

  const ratingResult = getOptionalNumberField(input, "rating");
  if (!ratingResult.success) return ratingResult;

  if (ratingResult.data !== undefined && (ratingResult.data < 0 || ratingResult.data > 5)) {
    return { success: false, message: "Rating deve ser entre 0 e 5." };
  }

  const contentResult = getOptionalStringField(input, "content");
  if (!contentResult.success) return contentResult;

  const hasSpoilerResult = getOptionalBooleanField(input, "hasSpoiler");
  if (!hasSpoilerResult.success) return hasSpoilerResult;

  const readingStartDateResult = getOptionalStringField(input, "readingStartDate");
  if (!readingStartDateResult.success) return readingStartDateResult;

  if (readingStartDateResult.data !== undefined && !isValidIsoDate(readingStartDateResult.data)) {
    return { success: false, message: "Campo readingStartDate deve estar no formato YYYY-MM-DD." };
  }

  const readingEndDateResult = getOptionalStringField(input, "readingEndDate");
  if (!readingEndDateResult.success) return readingEndDateResult;

  if (readingEndDateResult.data !== undefined && !isValidIsoDate(readingEndDateResult.data)) {
    return { success: false, message: "Campo readingEndDate deve estar no formato YYYY-MM-DD." };
  }

  const reviewIdResult = getOptionalNumberField(input, 'reviewId');
  if (!reviewIdResult.success) return reviewIdResult;

  return {
    success: true,
    data: {
      book: bookResult.data,
      category: categoryResult.data,
      rating: ratingResult.data ?? null,
      content: contentResult.data ?? null,
      hasSpoiler: hasSpoilerResult.data ?? false,
      readingStartDate: readingStartDateResult.data,
      readingEndDate: readingEndDateResult.data,
      reviewId: reviewIdResult.data ?? null,
    }
  };
}
