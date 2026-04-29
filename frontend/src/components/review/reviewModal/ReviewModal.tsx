import React, { useState } from 'react';
import './ReviewModal.scss';

type Props = {
  onClose: () => void;
  bookId?: string;
};

const ReviewModal: React.FC<Props> = ({ onClose }) => {
  const [rating, setRating] = useState<number>(0);

  return (
    <div className="review-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-content">
          <div className="review-stars" role="radiogroup" aria-label="Avaliação por estrelas">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                className={`star ${s <= rating ? 'selected' : ''}`}
                onClick={() => setRating(s)}
                aria-pressed={s <= rating}
                aria-label={`${s} estrela${s > 1 ? 's' : ''}`}
              >
                {s <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
