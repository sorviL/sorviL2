import type { FC } from "react";
import "./BookCover.scss";

type Props = {
  coverImage?: string | null;
  smallCoverImage?: string | null;
  title?: string | null;
};

export const BookCover: FC<Props> = ({ coverImage, smallCoverImage, title }) => {
  const src = coverImage ?? smallCoverImage ?? "";
  return (
    <div className="book-page-cover">
      {src ? (
        <img src={src} alt={title ?? "Capa do livro"} />
      ) : (
        <div className="book-cover-placeholder" aria-hidden>Sem capa</div>
      )}
    </div>
  );
};
