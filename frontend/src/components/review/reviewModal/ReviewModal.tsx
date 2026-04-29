import React from 'react';
import './ReviewModal.scss';

type Props = {
  onClose: () => void;
  bookId?: string;
};

const ReviewModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="review-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        {}
      </div>
    </div>
  );
};

export default ReviewModal;
