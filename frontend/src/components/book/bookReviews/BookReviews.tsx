import React, { useEffect, useState } from 'react';
import './BookReviews.scss';

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
        <a className="book-reviews-write" href="#write-review">Escrever resenha</a>
      </div>

      {loading && <div className="book-reviews-loading">Carregando resenhas</div>}

      {!loading && reviews && (
        <div className="book-reviews-grid">
          {reviews.map((r) => (
            <article key={r.id} className="review-card">
              <div className="review-card-top">
                <div className="review-author">{r.author}</div>
                <div className="review-rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              </div>
              {r.title && <div className="review-title">{r.title}</div>}
              <div className="review-body">{r.body}</div>
              <div className="review-meta">
                <span className="review-date">{r.date}</span>
                <span className="review-likes">❤️ {r.likes ?? 0}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && (!reviews || reviews.length === 0) && (
        <div className="book-reviews-empty">Sem resenhas. Seja o primeiro!</div>
      )}
    </section>
  );
};

export default BookReviews;
