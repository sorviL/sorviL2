import fs from "fs/promises";
import path from "path";
import db from "../../config/database.js";
import type { PublicUser, RecentBookItem, RecentBooksResult, RecentReviewItem, RecentReviewsResult, UpdateProfileInput } from "./profile.types.js";
import { getCurrentUser } from "../auth/auth.service.js";

type UserRecord = {
  id: number;
  nickname: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  deleted: number | boolean;
};

type RecentBookRow = {
  user_book_id: number;
  book_id: string;
  title: string;
  authors: string | null;
  cover_url: string | null;
  created_at: Date | string;
};

type RecentReviewRow = {
  review_id: number;
  book_id: string;
  title: string;
  authors: string | null;
  cover_url: string | null;
  rating: number | string;
  content: string;
  created_at: Date | string;
};

function toIsoDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function parseAuthors(authors: string | null): string[] {
  if (!authors) {
    return [];
  }

  try {
    const parsed = JSON.parse(authors);

    if (Array.isArray(parsed)) {
      return parsed.filter((author): author is string => typeof author === "string" && author.trim().length > 0);
    }
  } catch {
    return authors
      .split(",")
      .map((author) => author.trim())
      .filter((author) => author.length > 0);
  }

  return [];
}

function resolveLocalAvatarPath(avatarUrl: string | null): string | null {
  if (!avatarUrl) {
    return null;
  }

  let pathname = avatarUrl;

  try {
    pathname = new URL(avatarUrl).pathname;
  } catch {
  }

  if (!pathname.startsWith("/avatars/")) {
    return null;
  }

  const filename = path.basename(pathname);

  if (!filename) {
    return null;
  }

  return path.join(process.cwd(), "public", "avatars", filename);
}

async function deleteOldAvatarFile(avatarUrl: string | null): Promise<void> {
  const filePath = resolveLocalAvatarPath(avatarUrl);

  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("Não foi possível apagar avatar antigo:", filePath);
    }
  }
}

export async function getProfile(userId: number): Promise<PublicUser | null> {
  return getCurrentUser(userId);
}

export async function getRecentBooks(userId: number, limit = 5): Promise<RecentBooksResult> {
  const countRow = await db("user_books")
    .count("id as total")
    .where({ user_id: userId, deleted: false })
    .first();

  const total = Number(countRow?.["total"] ?? 0);

  const rows = await db<RecentBookRow>("user_books")
    .join("books", "books.id", "user_books.book_id")
    .select(
      "user_books.id as user_book_id",
      "books.google_books_id as book_id",
      "books.title",
      "books.authors",
      "books.cover_url",
      "user_books.created_at"
    )
    .where("user_books.user_id", userId)
    .where("user_books.deleted", false)
    .orderBy("user_books.created_at", "desc")
    .limit(limit);

  return {
    books: rows.map((row) => ({
      userBookId: row.user_book_id,
      bookId: row.book_id,
      bookTitle: row.title,
      bookAuthors: parseAuthors(row.authors),
      bookCoverImage: row.cover_url,
      createdAt: toIsoDate(row.created_at)
    })),
    total
  };
}

export async function getRecentReviews(userId: number, limit = 5): Promise<RecentReviewsResult> {
  const countRow = await db("reviews")
    .count("id as total")
    .where({ user_id: userId, deleted: false })
    .first();

  const total = Number(countRow?.["total"] ?? 0);

  const rows = await db<RecentReviewRow>("reviews")
    .join("books", "books.id", "reviews.book_id")
    .select(
      "reviews.id as review_id",
      "books.google_books_id as book_id",
      "books.title",
      "books.authors",
      "books.cover_url",
      "reviews.rating",
      "reviews.content",
      "reviews.created_at"
    )
    .where("reviews.user_id", userId)
    .where("reviews.deleted", false)
    .orderBy("reviews.created_at", "desc")
    .limit(limit);

  return {
    reviews: rows.map((row) => ({
      reviewId: row.review_id,
      bookId: row.book_id,
      bookTitle: row.title,
      bookAuthors: parseAuthors(row.authors),
      bookCoverImage: row.cover_url,
      rating: Number(row.rating),
      content: row.content,
      createdAt: toIsoDate(row.created_at)
    })),
    total
  };
}

export async function updateProfile(userId: number, input: UpdateProfileInput): Promise<{ success: true; user: PublicUser } | { success: false; status: number; message: string }> {
  if (input.nickname) {
    const existing = await db<UserRecord>("users")
      .where({ deleted: false })
      .andWhere("nickname", input.nickname)
      .first();

    if (existing && existing.id !== userId) {
      return { success: false, status: 409, message: "Nome de usuário já cadastrado." };
    }
  }

  const currentUser = await db<UserRecord>("users")
    .where({ id: userId, deleted: false })
    .first();

  if (!currentUser) {
    return { success: false, status: 404, message: "Usuário não encontrado." };
  }

  const updateData: Record<string, unknown> = {};

  if (input.nickname !== undefined) updateData["nickname"] = input.nickname;
  if (input.bio !== undefined) updateData["bio"] = input.bio;
  if (input.avatarUrl !== undefined) updateData["avatar_url"] = input.avatarUrl;

  if (Object.keys(updateData).length === 0) {
    const user = await getCurrentUser(userId);
    if (!user) return { success: false, status: 404, message: "Usuário não encontrado." };
    return { success: true, user };
  }

  updateData["updated_at"] = db.fn.now();

  await db("users").where({ id: userId, deleted: false }).update(updateData);

  if (input.avatarUrl !== undefined && currentUser.avatar_url && currentUser.avatar_url !== input.avatarUrl) {
    await deleteOldAvatarFile(currentUser.avatar_url);
  }

  const user = await getCurrentUser(userId);

  if (!user) {
    return { success: false, status: 404, message: "Usuário não encontrado." };
  }

  return { success: true, user };
}
