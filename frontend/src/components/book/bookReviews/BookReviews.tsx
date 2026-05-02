import React, { useEffect, useState } from 'react';
import './BookReviews.scss';
import AddReview from '../../addreview/AddReview';

type Review = {
  id: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  date: string; 
  likes?: number;
};

type Props = {
  bookId?: string;
};

export const BookReviews: React.FC<Props> = ({ bookId }) => {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      import('../../../assets/mocks/reviewsMockData').then(mod => {
        setReviews(mod.REVIEWS_MOCK);
        setLoading(false);
      }).catch(() => {
        setReviews([]);
        setLoading(false);
      });
    }, 200);

    return () => { };
  }, [bookId]);

  return (
    <section className="book-reviews">
      <div className="book-reviews-header">
        <h3>Resenhas da Comunidade</h3>
        <span className="book-reviews-write" onClick={() => setShowAddReview(true)}>Escrever resenha</span>
      </div>

      {loading && <div className="book-reviews-loading">Carregando resenhas</div>}

      {!loading && reviews && (
        <div className="book-reviews-grid">
          {reviews.map((r) => (
            <article key={r.id} className="review-card">
              <div className="review-card-top">
                <div className="review-author">{r.author}</div>
                <div className="review-rating">{Array.from({ length: r.rating }, (_, i) => <span key={`f${i}`} className="material-icons review-star">star</span>)}{Array.from({ length: 5 - r.rating }, (_, i) => <span key={`e${i}`} className="material-icons review-star">star_border</span>)}</div>
              </div>
              {r.title && <div className="review-title">{r.title}</div>}
              <div className="review-body">{r.body}</div>
              <div className="review-meta">
                <span className="review-date">{r.date}</span>
                <span className="review-likes"><span className="material-icons review-heart">favorite</span> {r.likes ?? 0}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && (!reviews || reviews.length === 0) && (
        <div className="book-reviews-empty">Sem resenhas. Seja o primeiro!</div>
      )}
      {showAddReview && <AddReview onClose={() => setShowAddReview(false)} />}
    </section>
  );
};

export default BookReviews;
