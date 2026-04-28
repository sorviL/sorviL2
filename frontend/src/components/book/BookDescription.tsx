import type { FC } from "react";

type Props = {
  description?: string | null;
  previewLink?: string | null;
};

export const BookDescription: FC<Props> = ({ description, previewLink }) => {
  return (
    <div className="book-description">
      {description ? (
        <p className="book-page-description">{description}</p>
      ) : (
        <p className="book-page-description">Sem descrição disponível.</p>
      )}

      {previewLink && (
        <a href={previewLink} target="_blank" rel="noreferrer" className="book-page-preview-link">
          Ver no Google Books
        </a>
      )}
    </div>
  );
};
