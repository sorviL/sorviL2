import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { GoogleBooksAPIController } from "../../assets/javascript/googleBooks/GoogleBooksAPIController";
import type { Book } from "../../types/book";
import "./BookPage.scss";

import { BookCover } from "../../components/book/BookCover";
import { BookStats } from "../../components/book/BookStats";
import { BookHeader } from "../../components/book/BookHeader";
import { BookTags } from "../../components/book/BookTags";
import { BookDescription } from "../../components/book/BookDescription";

const api = new GoogleBooksAPIController();

export function BookPage() {
    const { bookId } = useParams<{ bookId: string }>();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBook = useCallback(async () => {
        if (!bookId) return;
        setLoading(true);
        setError(null);

        if (process.env.NODE_ENV === "development" && bookId.startsWith("mock-")) {
            try {
                const mod = await import("./bookFixtures");
                const m = (mod.MOCK_BOOKS && mod.MOCK_BOOKS[bookId]) || mod.mockBookFull;
                setBook(m as Book);
            } catch (e) {
                setError("Não foi possível encontrar o livro (mock).");
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            const data = await api.getBookDetails(bookId);
            setBook(data);
        } catch (e) {
            setError("Não foi possível encontrar o livro.");
        } finally {
            setLoading(false);
        }
    }, [bookId]);

    useEffect(() => {
        fetchBook();
    }, [fetchBook]);

    const handleRetry = () => {
        fetchBook();
    };

    if (loading) {
        return (
            <div className="book-page">
                <div className="book-page-card">
                    <div className="skeleton">
                        <div className="skeleton-breadcrumb" />
                        <div className="book-page-inner">
                            <div className="left-col">
                                <div className="skeleton-cover" />
                                <div className="book-stats">
                                    <div className="stat skeleton-stat">&nbsp;</div>
                                    <div className="stat skeleton-stat">&nbsp;</div>
                                    <div className="stat skeleton-stat">&nbsp;</div>
                                </div>
                            </div>
                            <div className="book-page-info">
                                <div className="skeleton-line title" />
                                <div className="skeleton-line subtitle" />
                                <div className="skeleton-line author" />
                                <div className="skeleton-line long" />
                                <div className="skeleton-line long" />
                                <div className="skeleton-line short" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="book-page">
                <div className="book-page-card">
                    <div className="error-card">
                        <div className="error-emoji">😕</div>
                        <h3>Algo deu errado</h3>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button className="btn-retry" onClick={handleRetry}>Tentar novamente</button>
                            <Link to="/bookshelf" className="btn-back">Voltar</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) return <div className="book-page-error"><p>Livro não encontrado.</p></div>;

    return (
        <div className="book-page">
            <div className="book-page-card">
                <nav className="book-breadcrumb">
                    <Link to="/bookshelf">Bookshelf</Link>
                    <span className="sep">/</span>
                    <span className="current">{book.bookTitle}</span>
                </nav>

                <div className="book-page-inner">
                    <div className="left-col">
                        <BookCover
                            coverImage={book.bookCoverImage}
                            smallCoverImage={book.bookSmallCoverImage}
                            title={book.bookTitle}
                        />

                        <BookStats
                            averageRating={book.bookAverageRating}
                            ratingsCount={book.bookRatingsCount}
                            pageCount={book.bookPageCount}
                        />
                    </div>

                    <div className="book-page-info">
                        <BookHeader
                            title={book.bookTitle}
                            subtitle={book.bookSubtitle}
                            authors={book.bookAuthors}
                        />

                        <BookTags categories={book.bookCategories} />

                        <div className="book-page-meta">
                            {book.bookPublishedDate && <span className="book-page-meta-item">📅 {book.bookPublishedDate}</span>}
                            {book.bookLanguage && <span className="book-page-meta-item">🌐 {book.bookLanguage.toUpperCase()}</span>}
                            {book.bookPublisher && <span className="book-page-meta-item">🏢 {book.bookPublisher}</span>}
                        </div>

                        <hr className="book-page-divider" />

                        <BookDescription description={book.bookDescription} previewLink={book.bookPreviewLink} />
                    </div>
                </div>
            </div>
        </div>
    );
}
