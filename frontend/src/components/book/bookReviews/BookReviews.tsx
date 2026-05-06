import React, { useEffect, useState } from 'react';
import './BookReviews.scss';
import AddReview from '../../addreview/AddReview';
import { fetchBookStatus } from '../../../services/bookshelf.service';
import { fetchUserReview } from '../../../services/reviews.service';
import type { BookshelfLookupResponse } from '../../../services/bookshelf.types';
import { useAlert } from '../../alert/useAlert';

type Review = {
  id: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  date: string; 
  likes?: number;
};

function formatRelativeDate(dateValue: string): string {
  const date = new Date(dateValue);
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const diffInDays = Math.round(diffInSeconds / 86400);

  if (Math.abs(diffInDays) < 1) {
    return "hoje";
  }

  const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  return formatter.format(diffInDays, "day");
}

type Props = {
  bookId?: string;
  initialBook?: {
    bookId: string;
    bookTitle: string;
    bookAuthors: string[];
    bookCoverImage: string | null;
    bookPageCount: number | null;
  };
};

export const BookReviews: React.FC<Props> = ({ bookId, initialBook }) => {
  const { showAlert } = useAlert();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [bookStatus, setBookStatus] = useState<BookshelfLookupResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [editingReview, setEditingReview] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      import('../../../assets/mocks/reviewsMockData').then(mod => {
        setReviews(mod.REVIEWS_MOCK);
        setLoading(false);
      }).catch(() => {
        setReviews([]);
        setLoading(false);
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [bookId]);

  useEffect(() => {
    if (!bookId) {
      setBookStatus(null);
      return;
    }

    setStatusLoading(true);
    fetchBookStatus(bookId)
      .then((result) => {
        if (result.success) {
          setBookStatus(result.data);
          return;
        }
        setBookStatus(null);
      })
      .finally(() => setStatusLoading(false));
  }, [bookId]);

  const isInShelf = Boolean(bookStatus?.inShelf);
  const hasReview = Boolean(bookStatus?.hasReview);
  const writeDisabled = statusLoading;
  const writeLabel = hasReview ? "Editar resenha" : (isInShelf ? "Livro já na estante" : "Escrever resenha");

  return (
    <section className="book-reviews">
      <div className="book-reviews-header">
        <h3>Resenhas da Comunidade</h3>
        <span
          className={`book-reviews-write${isInShelf && !hasReview ? " muted" : ""}`}
          onClick={writeDisabled ? undefined : async () => {
            if (hasReview && bookId) {
              const resp = await fetchUserReview(bookId);
              if (resp.success) {
                const r = resp.data;
                setEditingReview(r ? { reviewId: r.id, rating: r.rating, content: r.content, hasSpoiler: r.hasSpoiler, createdAt: r.createdAt } : null);
                setShowAddReview(true);
                return;
              }
              showAlert("danger", "Erro ao carregar resenha.");
            }
            setEditingReview(null);
            setShowAddReview(true);
          }}
        >
          {writeLabel}
        </span>
      </div>

      {loading && <div className="book-reviews-loading">Carregando resenhas</div>}

      {!loading && reviews && (
        <div className="book-reviews-grid">
          {reviews.map((r) => (
              <article key={r.id} className="review-card">
                <div className="review-card-top">
                  <div className="review-author">{r.author}</div>
                  <div className="review-rating">
                    {Array.from({ length: r.rating }, (_, i) => (
                      <span key={`f${i}`} className="material-icons review-star">star</span>
                    ))}
                    {Array.from({ length: 5 - r.rating }, (_, i) => (
                      <span key={`e${i}`} className="material-icons review-star review-star-empty">star_border</span>
                    ))}
                  </div>
                </div>
                {r.title && <div className="review-title">{r.title}</div>}
                <div className="review-body">{r.body}</div>
                <div className="review-meta">
                  <span className="review-date">Postado {formatRelativeDate(r.date)}</span>
                  <span className="review-likes"><span className="material-icons review-heart">favorite</span> {r.likes ?? 0}</span>
                </div>
              </article>
          ))}
        </div>
      )}

      {!loading && (!reviews || reviews.length === 0) && (
        <div className="book-reviews-empty">Sem resenhas. Seja o primeiro!</div>
      )}
      {showAddReview && (
        <AddReview
          onClose={() => setShowAddReview(false)}
          initialBook={initialBook}
          initialReview={editingReview}
          initialCategory={bookStatus?.shelfStatus ?? null}
          onSaved={(status) => {
            setBookStatus((prev) => ({
              inShelf: status.inShelf,
              hasReview: status.hasReview,
              shelfStatus: status.shelfStatus ?? prev?.shelfStatus ?? null,
              userBookId: prev?.userBookId ?? null,
              isFavorite: prev?.isFavorite ?? false,
              currentPage: prev?.currentPage ?? null,
            }));
            setShowAddReview(false);
            setEditingReview(null);
          }}
        />
      )}
    </section>
  );
};

export default BookReviews;
