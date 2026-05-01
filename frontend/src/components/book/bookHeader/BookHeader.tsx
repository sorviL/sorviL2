import type { FC } from "react";
import "./BookHeader.scss";

type Props = {
  title?: string | null;
  subtitle?: string | null;
  authors?: string[];
};

export const BookHeader: FC<Props> = ({ title, subtitle, authors = [] }) => {
  return (
    <header className="book-header">
      <h1 className="book-page-title">{title}</h1>
      {subtitle && <h2 className="book-page-subtitle">{subtitle}</h2>}
      {authors.length > 0 && <p className="book-page-authors">{authors.join(", ")}</p>}
    </header>
  );
};
