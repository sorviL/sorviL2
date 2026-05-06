import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../assets/css/profile/profile-recent-books.scss";
import { getRecentProfileBooks, type RecentProfileBook } from "../../services/profile.service";

function formatRelativeDate(dateValue: string): string {
    const date = new Date(dateValue);
    const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const diffInDays = Math.round(diffInSeconds / 86400);

    if (Math.abs(diffInDays) < 1) {
        return "hoje";
    }

    const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
    return formatter.format(diffInDays, "day");
}

export function ProfileRecentBooks() {
    const [books, setBooks] = useState<RecentProfileBook[]>([]);
    const [totalBooks, setTotalBooks] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        async function loadBooks() {
            setIsLoading(true);
            const result = await getRecentProfileBooks();

            if (!isActive) {
                return;
            }

            if (!result.success) {
                setError(result.error);
                setBooks([]);
                setTotalBooks(0);
                setIsLoading(false);
                return;
            }

            setBooks(result.data.books);
            setTotalBooks(result.data.total);
            setError(null);
            setIsLoading(false);
        }

        void loadBooks();

        return () => {
            isActive = false;
        };
    }, []);

    const visibleBooks = books.slice(0, 5);

    return (
        <section className="profile-recent-books" aria-label="Últimos livros adicionados na estante">
            <div className="profile-recent-books-header">
                <div>
                    <h2 className="profile-recent-books-title">Seus últimos livros adicionados</h2>
                </div>
                <div className="profile-recent-books-actions">
                    <span className="profile-recent-books-count">{totalBooks} livros</span>
                    <Link to="/bookshelf" className="profile-recent-books-more">
                        Ver mais
                    </Link>
                </div>
            </div>

            <div className="profile-recent-books-grid">
                {isLoading && <p className="profile-recent-books-empty">Carregando seus livros mais recentes...</p>}
                {!isLoading && error && <p className="profile-recent-books-empty">{error}</p>}
                {!isLoading && !error && visibleBooks.length === 0 && (
                    <p className="profile-recent-books-empty">Você ainda não adicionou livros à estante.</p>
                )}
                {!isLoading && !error && visibleBooks.map((book) => (
                    <Link
                        key={book.userBookId}
                        to={`/book/${book.bookId}`}
                        className="profile-recent-book-link"
                        aria-label={`Abrir página do livro ${book.bookTitle}`}
                    >
                        <article className="profile-recent-book-card">
                            <div className="profile-recent-book-cover-wrap">
                                <img
                                    className="profile-recent-book-cover"
                                    src={book.bookCoverImage || "/images/no-photo.png"}
                                    alt={`Capa de ${book.bookTitle}`}
                                />
                            </div>

                            <div className="profile-recent-book-content">
                                <p className="profile-recent-book-added">Adicionado {formatRelativeDate(book.createdAt)}</p>
                                <h3 className="profile-recent-book-title">{book.bookTitle}</h3>
                                <p className="profile-recent-book-authors">{book.bookAuthors.join(", ")}</p>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </section>
    );
}
