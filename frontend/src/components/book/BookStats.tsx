import type { FC } from "react";

type Props = {
  averageRating?: number | null;
  ratingsCount?: number | null;
  pageCount?: number | null;
};

export const BookStats: FC<Props> = ({ averageRating, ratingsCount, pageCount }) => {
  return (
    <div className="book-stats" aria-hidden>
      <div className="stat">
        <div className="value">{averageRating ? averageRating.toFixed(1) : "—"}</div>
        <div className="label">Rating</div>
      </div>

      <div className="stat">
        <div className="value">{ratingsCount ?? "—"}</div>
        <div className="label">Reviews</div>
      </div>

      <div className="stat">
        <div className="value">{pageCount ?? "—"}</div>
        <div className="label">Páginas</div>
      </div>
    </div>
  );
};
