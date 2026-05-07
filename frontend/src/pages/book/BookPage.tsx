import { useEffect, useLayoutEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { GoogleBooksAPIController } from "../../assets/javascript/googleBooks/GoogleBooksAPIController";
import type { Book } from "../../types/book";
import "./BookPage.scss";

import { BookCover } from "../../components/book/bookCover/BookCover";
import { BookStats } from "../../components/book/bookStats/BookStats";
import { BookHeader } from "../../components/book/bookHeader/BookHeader";
import { BookTags } from "../../components/book/bookTags/BookTags";
import { BookDescription } from "../../components/book/bookDescription/BookDescription";
import { BookReviews } from "../../components/book/bookReviews/BookReviews";
import AddReview from "../../components/addreview/AddReview";
import { fetchBookReviewStats, fetchUserReview } from "../../services/reviews.service";
import { fetchBookStatus } from "../../services/bookshelf.service";
import type { BookshelfLookupResponse } from "../../services/bookshelf.types";
import type { ShelfStatus } from "../../types/bookshelf";

const api = new GoogleBooksAPIController();

export function BookPage() {
    const { id: bookId } = useParams<{ id: string }>();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [communityAverageRating, setCommunityAverageRating] = useState<number | null>(null);
    const [communityReviewsCount, setCommunityReviewsCount] = useState<number | null>(null);

    const [fabReviewOpen, setFabReviewOpen] = useState(false);
    const [fabEditingReview, setFabEditingReview] = useState<any | null>(null);
    const [fabInitialCategory, setFabInitialCategory] = useState<ShelfStatus | null>(null);
    const [fabBookStatus, setFabBookStatus] = useState<BookshelfLookupResponse | null>(null);

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [bookId]);

    const fetchBook = useCallback(async () => {
        if (!bookId) return;
        setLoading(true);
        setError(null);

        if (import.meta.env.DEV && bookId.startsWith("mock-")) {
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

    useEffect(() => {
        let isActive = true;
        if (!bookId) {
            setCommunityAverageRating(null);
            setCommunityReviewsCount(null);
            return;
        }

        fetchBookReviewStats(bookId)
            .then((result) => {
                if (!isActive) return;
                if (result.success) {
                    setCommunityAverageRating(result.data.averageRating);
                    setCommunityReviewsCount(result.data.reviewsCount);
                } else {
                    setCommunityAverageRating(null);
                    setCommunityReviewsCount(null);
                }
            })
            .catch(() => {
                if (!isActive) return;
                setCommunityAverageRating(null);
                setCommunityReviewsCount(null);
            });

        return () => {
            isActive = false;
        };
    }, [bookId]);

    useEffect(() => {
        let isActive = true;
        if (!bookId) {
            setFabBookStatus(null);
            return;
        }

        fetchBookStatus(bookId)
            .then((result) => {
                if (!isActive) return;
                if (result.success) {
                    setFabBookStatus(result.data);
                } else {
                    setFabBookStatus(null);
                }
            })
            .catch(() => {
                if (!isActive) return;
                setFabBookStatus(null);
            });

        return () => {
            isActive = false;
        };
    }, [bookId]);

    const handleRetry = () => fetchBook();

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
                        <span className="material-icons error-emoji">sentiment_dissatisfied</span>
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

    const reviewBook = {
        bookId: book.bookId,
        bookTitle: book.bookTitle ?? "Livro sem título",
        bookAuthors: book.bookAuthors,
        bookCoverImage: book.bookCoverImage ?? '/images/empty-bookshelf.png',
        bookPageCount: book.bookPageCount
    };

    const fabIsInShelf = Boolean(fabBookStatus?.inShelf);
    const fabLabel = fabIsInShelf ? "Editar resenha" : "Escrever resenha";
    const fabIcon = fabIsInShelf ? "edit" : "add";

    return (
        <div className="book-page">
            <div className="book-page-card">
                <nav className="book-breadcrumb">
                    <Link to="/bookshelf">Estante</Link>
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
                            averageRating={communityAverageRating}
                            ratingsCount={communityReviewsCount}
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
                            {book.bookPublishedDate && <span className="book-page-meta-item"><span className="material-icons book-meta-icon">calendar_today</span> {book.bookPublishedDate}</span>}
                            {book.bookLanguage && <span className="book-page-meta-item"><span className="material-icons book-meta-icon">language</span> {book.bookLanguage.toUpperCase()}</span>}
                            {book.bookPublisher && <span className="book-page-meta-item"><span className="material-icons book-meta-icon">business</span> {book.bookPublisher}</span>}
                        </div>
                        <hr className="book-page-divider" />
                        <BookDescription description={book.bookDescription} previewLink={book.bookPreviewLink} />
                    </div>
                </div>

                <BookReviews
                    bookId={book.bookId}
                    initialBook={reviewBook}
                />
            </div>

            {}
            <button
                className="book-fab"
                onClick={async () => {
                    try {
                        const [resp, statusResp] = await Promise.all([
                            fetchUserReview(book.bookId),
                            fetchBookStatus(book.bookId),
                        ]);

                        if (resp && resp.success) {
                            const r = resp.data;
                            setFabEditingReview(r ? { reviewId: r.id, rating: r.rating, content: r.content, hasSpoiler: r.hasSpoiler, createdAt: r.createdAt } : null);
                        } else {
                            setFabEditingReview(null);
                        }

                        if (statusResp && statusResp.success) {
                            setFabInitialCategory(statusResp.data?.shelfStatus ?? null);
                            setFabBookStatus(statusResp.data);
                        } else {
                            setFabInitialCategory(null);
                            setFabBookStatus(null);
                        }
                    } catch {
                        setFabEditingReview(null);
                        setFabInitialCategory(null);
                        setFabBookStatus(null);
                    } finally {
                        setFabReviewOpen(true);
                    }
                }}
                aria-label={fabLabel}
                title={fabLabel}
            >
                <span className="material-icons">{fabIcon}</span>
            </button>

            {}
            {fabReviewOpen && (
                <AddReview
                    initialBook={reviewBook}
                    initialReview={fabEditingReview}
                    initialCategory={fabInitialCategory}
                    onClose={() => {
                        setFabReviewOpen(false);
                        setFabEditingReview(null);
                        setFabInitialCategory(null);
                    }}
                    onSaved={() => {
                        setFabReviewOpen(false);
                        setFabEditingReview(null);
                        setFabInitialCategory(null);
                        fetchBookStatus(book.bookId)
                            .then((result) => {
                                if (result.success) {
                                    setFabBookStatus(result.data);
                                } else {
                                    setFabBookStatus(null);
                                }
                            })
                            .catch(() => setFabBookStatus(null));
                        fetchBookReviewStats(book.bookId)
                            .then((result) => {
                                if (result.success) {
                                    setCommunityAverageRating(result.data.averageRating);
                                    setCommunityReviewsCount(result.data.reviewsCount);
                                } else {
                                    setCommunityAverageRating(null);
                                    setCommunityReviewsCount(null);
                                }
                            })
                            .catch(() => {
                                setCommunityAverageRating(null);
                                setCommunityReviewsCount(null);
                            });
                        fetchBook();
                    }}
                />
            )}
        </div>
    );
}
