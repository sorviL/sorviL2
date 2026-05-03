export type ReviewResponse = {
  id: number;
  user_id: number;
  author_name: string;
  author_avatar?: string | null;
  book_id: number;
  rating: number | null;
  content: string | null;
  has_spoiler: boolean | number;
  created_at: string;
};

export type AllReviewsResponse = {
  items: ReviewResponse[];
  total: number;
  page: number;
  pageSize: number;
};

export type RecentReviewsParams = {
  userId?: number;
  bookId?: number;
  limit?: number;
};
