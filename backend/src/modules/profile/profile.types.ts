import type { PublicUser } from "../auth/auth.types.js";

export type RecentBookItem = {
  readonly userBookId: number;
  readonly bookId: string;
  readonly bookTitle: string;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly createdAt: string;
};

export type RecentBooksResult = {
  readonly books: RecentBookItem[];
  readonly total: number;
};

export type RecentReviewItem = {
  readonly reviewId: number;
  readonly bookId: string;
  readonly bookTitle: string;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly rating: number;
  readonly content: string;
  readonly createdAt: string;
};

export type RecentReviewsResult = {
  readonly reviews: RecentReviewItem[];
  readonly total: number;
};

export type UpdateProfileInput = {
  nickname?: string | undefined;
  bio?: string | null | undefined;
  avatarUrl?: string | null | undefined;
};

export type { PublicUser };
