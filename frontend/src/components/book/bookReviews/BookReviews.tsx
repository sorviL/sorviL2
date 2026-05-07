import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./BookReviews.scss";
import AddReview from "../../addreview/AddReview";
import { fetchBookStatus } from "../../../services/bookshelf.service";
import { fetchRecentReviews, fetchUserReview } from "../../../services/reviews.service";
import type { BookshelfLookupResponse } from "../../../services/bookshelf.types";
import { useAlert } from "../../alert/useAlert";

type Review = {
  id: string;
  author: string;
  rating: number;
  body: string;
  date: string;
  isSpoiler: boolean;
};

type EditingReview = {
  reviewId: number;
  rating: number | null;
  content: string | null;
  hasSpoiler: boolean;
  createdAt: string | null;
} | null;

const REVIEWS_FETCH_LIMIT = 200;
const DEFAULT_VISIBLE_REVIEWS = 3;

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [bookStatus, setBookStatus] = useState<BookshelfLookupResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [editingReview, setEditingReview] = useState<EditingReview>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState<number>(DEFAULT_VISIBLE_REVIEWS);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    function updateVisibleCount() {
      const isMobile = window.innerWidth <= 580;
      setVisibleCount(isMobile ? 1 : DEFAULT_VISIBLE_REVIEWS);
    }

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);


  const loadBookReviews = useCallback(async () => {
    if (!bookId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await fetchRecentReviews(undefined, undefined, REVIEWS_FETCH_LIMIT);

    if (!result.success) {
      setReviews([]);
      setLoading(false);
      return;
    }

    const filteredReviews = result.data
      .filter((review) => review.googleBooksId === bookId)
      .map((review) => ({
        id: review.id,
        author: review.author || "Leitor(a) anônimo(a)",
        rating: Math.max(0, Math.min(5, review.rating ?? 0)),
        body: review.text?.trim() || "Usuário avaliou este livro sem comentário.",
        date: review.date || new Date().toISOString(),
        isSpoiler: Boolean(review.isSpoiler),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setReviews(filteredReviews);
    setCarouselIndex(0);
    setLoading(false);
  }, [bookId]);

  useEffect(() => {
    setRevealedSpoilers(new Set());
    loadBookReviews();
  }, [loadBookReviews]);

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
  const maxCarouselIndex = Math.max(0, reviews.length - visibleCount);
  const hasCarousel = reviews.length > visibleCount;

  useEffect(() => {
    // clamp carousel when visibleCount changes
    const maxIdx = Math.max(0, reviews.length - visibleCount);
    if (carouselIndex > maxIdx) setCarouselIndex(maxIdx);
  }, [visibleCount, reviews.length]);

  const visibleReviews = useMemo(
    () => reviews.slice(carouselIndex, carouselIndex + visibleCount),
    [reviews, carouselIndex, visibleCount]
  );

  const revealSpoiler = (reviewId: string) => {
    setRevealedSpoilers((current) => {
      const next = new Set(current);
      next.add(reviewId);
      return next;
    });
  };

  return (
    <section className="book-reviews">
      <div className="book-reviews-header">
        <div className="book-reviews-title-wrap">
          <h3>Resenhas da Comunidade</h3>
          {!loading && reviews.length > 0 && (
            <span className="book-reviews-count">{reviews.length} resenha{reviews.length > 1 ? "s" : ""}</span>
          )}
        </div>
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

      {hasCarousel && (
        <div className="book-reviews-carousel-controls">
          <button
            type="button"
            className="book-reviews-carousel-arrow"
            onClick={() => setCarouselIndex((current) => Math.max(0, current - 1))}
            disabled={carouselIndex === 0}
            aria-label="Ver resenhas anteriores"
          >
            <span className="material-icons">arrow_back_ios_new</span>
          </button>
          <button
            type="button"
            className="book-reviews-carousel-arrow"
            onClick={() => setCarouselIndex((current) => Math.min(maxCarouselIndex, current + 1))}
            disabled={carouselIndex >= maxCarouselIndex}
            aria-label="Ver mais resenhas"
          >
            <span className="material-icons">arrow_forward_ios</span>
          </button>
        </div>
      )}

      {loading && <div className="book-reviews-loading">Carregando resenhas...</div>}

      {!loading && reviews.length > 0 && (
        <div className="book-reviews-grid">
          {visibleReviews.map((r) => {
            const isSpoiler = r.isSpoiler && !revealedSpoilers.has(r.id);

            return (
              <article key={r.id} className="review-card">
                <div className="review-card-top">
                  <div className="review-author">{r.author}</div>
                  {(() => {
                    const fullStars = Math.floor(r.rating);
                    const hasHalf = (r.rating - fullStars) >= 0.5;
                    const empty = 5 - fullStars - (hasHalf ? 1 : 0);
                    return (
                      <div className="review-rating" aria-hidden>
                        {Array.from({ length: fullStars }, (_, i) => (
                          <span key={`f${i}`} className="material-icons review-star">star</span>
                        ))}
                        {hasHalf && <span key="half" className="material-icons review-star">star_half</span>}
                        {Array.from({ length: empty }, (_, i) => (
                          <span key={`e${i}`} className="material-icons review-star review-star-empty">star_border</span>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className={`review-body-wrap${isSpoiler ? " is-spoiler" : ""}`}>
                  {(() => {
                    const isMobile = visibleCount === 1;
                    const isExpanded = expandedReviews.has(r.id);
                    return (
                      <>
                        <p className={`review-body ${isMobile && !isExpanded ? "clamped" : ""}`}>{r.body}</p>
                        {isMobile && r.body && r.body.length > 220 && (
                          <button type="button" className="review-readmore" onClick={() => toggleExpanded(r.id)} aria-expanded={isExpanded}>
                            {isExpanded ? "Mostrar menos" : "Ler mais"}
                          </button>
                        )}
                      </>
                    );
                  })()}

                  {isSpoiler && (
                    <button
                      type="button"
                      className="review-spoiler-overlay"
                      onClick={() => revealSpoiler(r.id)}
                      aria-label={`Revelar spoiler da resenha de ${r.author}`}
                    >
                      <div className="review-skeleton-line" style={{ width: "86%" }} />
                      <div className="review-skeleton-line" style={{ width: "54%" }} />
                      <div className="review-skeleton-line" style={{ width: "34%" }} />
                      <div className="review-skeleton-line" style={{ width: "90%" }} />
                      <div className="review-skeleton-line" style={{ width: "74%" }} />
                      <span className="review-spoiler-label">
                        <svg className="review-spoiler-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                          <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                        </svg>
                        SPOILER
                      </span>
                    </button>
                  )}
                </div>

                <div className="review-meta">
                  <span className="review-date">Postado {formatRelativeDate(r.date)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && reviews.length === 0 && (
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
            loadBookReviews();
          }}
        />
      )}
    </section>
  );
};

export default BookReviews;
