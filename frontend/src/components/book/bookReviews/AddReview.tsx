import React from 'react';

type Props = { onClose: () => void };

const AddReview: React.FC<Props> = ({ onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface-white)',
          padding: 20,
          borderRadius: 8,
          minWidth: 320,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Escrever resenha</h3>
        <p>Conteúdo do modal para adicionar resenha (placeholder).</p>
        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default AddReview;
