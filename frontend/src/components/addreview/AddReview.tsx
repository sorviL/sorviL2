import React from 'react';
import './AddReview.scss';

type Props = { onClose: () => void };

const AddReview: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="addreview-overlay" onClick={onClose}>
      <div className="addreview-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Escrever resenha</h3>
        <div className="addreview-actions">
        </div>
      </div>
    </div>
  );
};

export default AddReview;
