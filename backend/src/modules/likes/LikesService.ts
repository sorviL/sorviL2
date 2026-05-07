import db from "../../config/database.js";

type ToggleResult = { liked: boolean; likeCount: number };

export class LikesService {
  async toggleReviewLike(userId: number, reviewId: number): Promise<ToggleResult> {
    const existing = await db("review_reactions")
      .where({ user_id: userId, review_id: reviewId, type: "like" })
      .first();

    if (existing) {
      await db("review_reactions").where({ id: existing.id }).delete();
    } else {
      await db("review_reactions").insert({
        user_id: userId,
        review_id: reviewId,
        type: "like"
      });
    }

    const countRow = await db("review_reactions")
      .count("id as count")
      .where({ review_id: reviewId, type: "like" })
      .first();

    return {
      liked: !existing,
      likeCount: Number(countRow?.["count"] ?? 0)
    };
  }

  async toggleUpdateLike(userId: number, updateId: number): Promise<ToggleResult> {
    const existing = await db("reading_update_likes")
      .where({ user_id: userId, reading_update_id: updateId })
      .first();

    if (existing) {
      await db("reading_update_likes").where({ id: existing.id }).delete();
    } else {
      await db("reading_update_likes").insert({
        user_id: userId,
        reading_update_id: updateId
      });
    }

    const countRow = await db("reading_update_likes")
      .count("id as count")
      .where({ reading_update_id: updateId })
      .first();

    return {
      liked: !existing,
      likeCount: Number(countRow?.["count"] ?? 0)
    };
  }
}

export const likesService = new LikesService();
