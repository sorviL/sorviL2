import React, { useState } from 'react';
import './AddReview.scss';

type Props = { onClose: () => void };

const CATEGORIES = [
  { value: 'lendo', label: 'Lendo' },
  { value: 'quero_ler', label: 'Quero Ler' },
  { value: 'lido', label: 'Lido' },
  { value: 'relendo', label: 'Relendo' },
  { value: 'abandonado', label: 'Abandonado' },
  { value: 'favoritos', label: 'Favoritos' },
];

const AddReview: React.FC<Props> = ({ onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [category, setCategory] = useState<string>('lido');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ rating, title, body, category });
    onClose();
  };

  return (
    <div className="addreview-overlay" onClick={onClose}>
      <div className="addreview-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Escrever resenha</h3>

        <form className="addreview-form" onSubmit={handleSubmit}>
          <label className="addreview-field">
            <div className="label">Avaliação</div>
            <div className="addreview-stars">
              {Array.from({ length: 5 }, (_, i) => {
                const val = i + 1;
                const isActive = val <= (hover || rating);
                return (
                  <span
                    key={val}
                    className={`material-icons addreview-star ${isActive ? 'active' : ''}`}
                    onClick={() => setRating(val)}
                    onMouseEnter={() => setHover(val)}
                    onMouseLeave={() => setHover(0)}
                  >
                    {isActive ? 'star' : 'star_border'}
                  </span>
                );
              })}
            </div>
          </label>

          <label className="addreview-field">
            <div className="label">Título</div>
            <input className="addreview-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label className="addreview-field">
            <div className="label">Resenha</div>
            <textarea className="addreview-textarea" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
          </label>

          <label className="addreview-field">
            <div className="label">Categoria</div>
            <select className="addreview-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>

          <div className="addreview-actions">
            <button type="button" className="addreview-close" onClick={onClose}>Fechar</button>
            <button type="submit" className="addreview-submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReview;
