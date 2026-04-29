import React, { useState } from 'react';
import './ReviewModal.scss';

type Props = {
  onClose: () => void;
  bookId?: string;
};

const ReviewModal: React.FC<Props> = ({ onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const handleSave = () => {
    console.log('Salvar resenha', { title, body, rating });
    onClose();
  };

  return (
    <div className="review-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-content">
          <h2 className="modal-title">Escrever resenha</h2>

          <input
            className="review-title"
            placeholder="Título (opcional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Título da resenha"
          />

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

          <textarea
            className="review-body"
            placeholder="Escreva sua resenha..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            aria-label="Corpo da resenha"
          />

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn-save" onClick={handleSave}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
