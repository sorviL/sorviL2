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
  return (
    <li key={book.googleBooksId ?? index} className="feed-sidebar-book">
      <div className="feed-sidebar-book-cover">
        {book.coverUrl ? <img src={book.coverUrl} alt={book.title} /> : <div className="feed-sidebar-book-placeholder"></div>}
      </div>
      <div className="feed-sidebar-book-info">
        <div className="feed-sidebar-book-title">{book.title}</div>
        <div className="feed-sidebar-book-author">{(book.authors || []).join(", ")}</div>
        {showReviews && <div className="feed-sidebar-book-reviews">{book.reviews ?? 0} resenhas</div>}
      </div>
    </li>
  );
}