import type { FC } from "react";
import "./BookTags.scss";

type Props = {
  categories?: string[];
};

export const BookTags: FC<Props> = ({ categories = [] }) => {
  if (!categories || categories.length === 0) return null;
  return (
    <div className="book-tags" aria-label="Categorias do livro">
      {categories.map((c) => (
        <span key={c} className="tag">{c}</span>
      ))}
    </div>
  );
};
