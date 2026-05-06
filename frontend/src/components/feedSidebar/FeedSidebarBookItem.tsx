import { Link } from "react-router-dom";

type FeedSidebarBook = {
  title?: string;
  authors?: string[];
  coverUrl?: string | null;
  googleBooksId?: string | null;
  reviews?: number;
};

type FeedSidebarBookItemProps = {
  book: FeedSidebarBook;
  index: number;
  showReviews?: boolean;
};

export function FeedSidebarBookItem({ book, index, showReviews = false }: FeedSidebarBookItemProps) {
  const content = (
    <>
      <div className="feed-sidebar-book-cover">
        {book.coverUrl ? <img src={book.coverUrl} alt={book.title} /> : <div className="feed-sidebar-book-placeholder"></div>}
      </div>
      <div className="feed-sidebar-book-info">
        <div className="feed-sidebar-book-title">{book.title}</div>
        <div className="feed-sidebar-book-author">{(book.authors || []).join(", ")}</div>
        {showReviews && <div className="feed-sidebar-book-reviews">{book.reviews ?? 0} resenhas</div>}
      </div>
    </>
  );

  return (
    <li key={book.googleBooksId ?? index} className="feed-sidebar-book">
      {book.googleBooksId ? (
        <Link to={`/book/${book.googleBooksId}`} className="feed-sidebar-book-link">
          {content}
        </Link>
      ) : content}
    </li>
  );
}