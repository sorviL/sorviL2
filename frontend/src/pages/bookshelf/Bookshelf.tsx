import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { flushSync } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { BookCard } from "../../components/bookshelf/bookCard/BookCard";
import { PageCounter } from "../../components/bookshelf/pageCounter/PageCounter";
import { BookshelfSidebar } from "../../components/bookshelf/bookshelfSidebar/BookshelfSidebar";
import { Pagination } from "../../components/bookshelf/pagination/Pagination";
import { BookshelfEmptyState } from "../../components/bookshelf/emptyState/BookshelfEmptyState";
import { BookshelfSkeleton } from "../../components/bookshelf/skeleton/BookshelfSkeleton";
import { fetchBookshelf, removeBookFromShelf } from "../../services/bookshelf.service";
import { fetchRecentReviews } from "../../services/reviews.service";
import type { ReviewData } from "../../services/reviews.service";
import { fetchAllReadingUpdates } from "../../services/readingUpdates.service";
import { ReviewViewer } from "../../components/reviewviewer/ReviewViewer";
import AddReview from "../../components/addreview/AddReview";
import { RemoveBookModal } from "../../components/bookshelf/removeBookModal/RemoveBookModal";
import type { BookshelfItemDto } from "../../services/bookshelf.types";
import type { BookshelfFilter } from "../../types/bookshelf";
import { useAuth } from "../../contexts/auth.context";
import { useAlert } from "../../components/alert/useAlert";
import "./Bookshelf.scss";

const BOOK_CARD_WIDTH = 135;
const BOOK_GRID_GAP = 24;
const VISIBLE_ROWS = 4;

function calculateBooksPerPage(gridContainerWidth: number): number {
    const columnsPerRow = Math.floor((gridContainerWidth + BOOK_GRID_GAP) / (BOOK_CARD_WIDTH + BOOK_GRID_GAP));
    return Math.max(columnsPerRow, 1) * VISIBLE_ROWS;
}

function getFilterFromQuery(filter: string | null): BookshelfFilter | null {
    if (filter === "reviews" || filter === "updates") {
        return filter;
    }

    return null;
}

export function BookshelfPage() {
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const [searchParams, setSearchParams] = useSearchParams();
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const [booksPerPage, setBooksPerPage] = useState(VISIBLE_ROWS);
    const [activeFilter, setActiveFilter] = useState<BookshelfFilter | null>(() => getFilterFromQuery(searchParams.get("filter")));
    const [currentPage, setCurrentPage] = useState(1);

    const [books, setBooks] = useState<BookshelfItemDto[]>([]);
    const [filterCounts, setFilterCounts] = useState<Record<string, number>>({});
    const [totalPagesRead, setTotalPagesRead] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditReview, setShowEditReview] = useState(false);
    const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
    const [bookToRemove, setBookToRemove] = useState<BookshelfItemDto | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [reviews, setReviews] = useState<ReviewData[]>([]);

    async function loadBookshelf(filter: BookshelfFilter | null) {
        const countsPromise = fetchBookshelf(null);

        if (filter === "updates") {
            const [countsRes, res] = await Promise.all([countsPromise, fetchAllReadingUpdates(1, 100)]);

            if (countsRes.success) {
                setFilterCounts(countsRes.data.filterCounts);
                setTotalPagesRead(countsRes.data.totalPagesRead);
            }

            if (res.success) {
                setBooks([]);
                setReviews(res.data.items.map((u) => ({
                    id: String(u.id),
                    userId: user?.id,
                    author: user?.nickname ?? "",
                    authorAvatar: user?.avatarUrl ?? null,
                    rating: 0,
                    text: u.comment,
                    date: u.createdAt,
                    isSpoiler: u.hasSpoiler,
                    bookTitle: u.bookTitle,
                    coverUrl: u.bookCoverImage,
                    googleBooksId: u.googleBooksId,
                    bookAuthors: u.bookAuthors,
                    bookPageCount: u.bookPageCount,
                    currentPage: u.currentPage,
                    percentage: u.percentage,
                    reaction: u.reaction,
                })));
            } else {
                showAlert("danger", "Erro ao carregar atualizações.");
            }
            setIsLoading(false);
            return;
        }

        if (filter === "reviews") {
            const countsRes = await countsPromise;
            if (countsRes.success) {
                setFilterCounts(countsRes.data.filterCounts);
                setTotalPagesRead(countsRes.data.totalPagesRead);
            }

            if (!user?.id) {
                setReviews([]);
                setBooks([]);
                setIsLoading(false);
                return;
            }

            const res = await fetchRecentReviews(user.id, undefined, 10);
            if (res.success) {
                setBooks([]);
                setReviews(res.data || []);
            } else {
                showAlert("danger", "Erro ao carregar resenhas.");
            }
            setIsLoading(false);
            return;
        }

        const result = await countsPromise;

        if (filter) {
            const filtered = await fetchBookshelf(filter);
            if (filtered.success) {
                setBooks(filtered.data.books);
            }
        } else if (result.success) {
            setBooks(result.data.books);
        }

        if (result.success) {
            setFilterCounts(result.data.filterCounts);
            setTotalPagesRead(result.data.totalPagesRead);
        } else {
            showAlert("danger", "Erro ao carregar estante.");
        }

        setIsLoading(false);
    }

    useEffect(() => {
        const gridContainer = gridContainerRef.current;
        if (!gridContainer) return;

        let previousBooksPerPage = 0;
        const resizeObserver = new ResizeObserver((entries) => {
            const containerWidth = entries[0].contentRect.width;
            const newBooksPerPage = calculateBooksPerPage(containerWidth);
            if (newBooksPerPage !== previousBooksPerPage) {
                const savedScrollPosition = window.scrollY;
                previousBooksPerPage = newBooksPerPage;
                flushSync(() => setBooksPerPage(newBooksPerPage));
                window.scrollTo(0, savedScrollPosition);
            }
        });

        resizeObserver.observe(gridContainer);
        previousBooksPerPage = calculateBooksPerPage(gridContainer.clientWidth);
        setBooksPerPage(previousBooksPerPage);

        return () => resizeObserver.disconnect();
    }, [isLoading]);

    function handleFilterChange(filter: BookshelfFilter | null) {
        if (filter === null) {
            setSearchParams({});
        } else {
            setSearchParams({ filter });
        }

        setActiveFilter(filter);
        setCurrentPage(1);
        setIsLoading(true);
    }

    useEffect(() => {
        let cancelled = false;

        async function loadInitialBookshelf() {
            const countsPromise = fetchBookshelf(null);

            if (activeFilter === "updates") {
                const [countsRes, res] = await Promise.all([countsPromise, fetchAllReadingUpdates(1, 100)]);
                if (cancelled) return;

                if (countsRes.success) {
                    setFilterCounts(countsRes.data.filterCounts);
                    setTotalPagesRead(countsRes.data.totalPagesRead);
                }

                if (res.success) {
                    setBooks([]);
                    setReviews(res.data.items.map((u) => ({
                        id: String(u.id),
                        userId: user?.id,
                        author: user?.nickname ?? "",
                        authorAvatar: user?.avatarUrl ?? null,
                        rating: 0,
                        text: u.comment,
                        date: u.createdAt,
                        isSpoiler: u.hasSpoiler,
                        bookTitle: u.bookTitle,
                        coverUrl: u.bookCoverImage,
                        googleBooksId: u.googleBooksId,
                        bookAuthors: u.bookAuthors,
                        bookPageCount: u.bookPageCount,
                        currentPage: u.currentPage,
                        percentage: u.percentage,
                        reaction: u.reaction,
                    })));
                }
                setIsLoading(false);
                return;
            }

            if (activeFilter === "reviews") {
                const countsRes = await countsPromise;
                if (cancelled) return;

                if (countsRes.success) {
                    setFilterCounts(countsRes.data.filterCounts);
                    setTotalPagesRead(countsRes.data.totalPagesRead);
                }

                if (!user?.id) {
                    setReviews([]);
                    setBooks([]);
                    setIsLoading(false);
                    return;
                }

                const res = await fetchRecentReviews(user.id, undefined, 10);
                if (cancelled) return;

                if (res.success) {
                    setBooks([]);
                    setReviews(res.data || []);
                }
                setIsLoading(false);
                return;
            }

            const result = await countsPromise;
            if (cancelled) return;

            if (result?.success) {
                setFilterCounts(result.data.filterCounts);
                setTotalPagesRead(result.data.totalPagesRead);
            }

            if (activeFilter) {
                const filtered = await fetchBookshelf(activeFilter);
                if (cancelled) return;

                if (filtered.success) {
                    setBooks(filtered.data.books);
                }
            } else if (result?.success) {
                setBooks(result.data.books);
            }

            setIsLoading(false);
        }

        loadInitialBookshelf();

        return () => {
            cancelled = true;
        };
    }, [activeFilter, user?.id]);

    function handleRemoveBook(bookId: string) {
        const book = books.find((b) => b.bookId === bookId);
        if (!book) return;
        setBookToRemove(book);
    }

    async function handleConfirmRemove() {
        if (!bookToRemove) return;

        setIsRemoving(true);
        const result = await removeBookFromShelf(bookToRemove.userBookId);

        if (result.success) {
            showAlert("success", "Livro removido da estante.");
            setBookToRemove(null);
            setIsLoading(true);
            await loadBookshelf(activeFilter);
        } else {
            showAlert("danger", "Erro ao remover livro.");
        }

        setIsRemoving(false);
    }

    const totalPages = Math.ceil(books.length / booksPerPage);
    const firstBookIndex = (currentPage - 1) * booksPerPage;
    const visibleBooks = books.slice(firstBookIndex, firstBookIndex + booksPerPage);
    const reviewViewerItems = reviews.map((review) => ({
        id: review.id,
        userId: review.userId,
        author: review.author,
        rating: review.rating,
        text: review.text ?? "",
        date: review.date,
        coverUrl: review.coverUrl ?? undefined,
        bookTitle: review.bookTitle ?? undefined,
        isSpoiler: review.isSpoiler,
        authorAvatar: review.authorAvatar ?? undefined,
        googleBooksId: review.googleBooksId ?? undefined,
        bookAuthors: review.bookAuthors ?? [],
        bookPageCount: review.bookPageCount ?? null,
        currentPage: review.currentPage ?? null,
        percentage: review.percentage ?? null,
        reaction: review.reaction ?? null,
    }));

    const handleEditReview = (reviewId: string) => {
        const selected = reviews.find((review) => review.id === reviewId);
        if (!selected) return;
        setEditingReview(selected);
        setShowEditReview(true);
    };

    return (
        <div className="bookshelf-page">
            <aside className="bookshelf-page-sidebar">
                <div className="bookshelf-page-sidebar-sticky">
                    <PageCounter totalPagesRead={totalPagesRead} />
                    <BookshelfSidebar
                        activeFilter={activeFilter}
                        onFilterChange={handleFilterChange}
                        filterCounts={filterCounts}
                    />
                </div>
            </aside>
            <h1 className="bookshelf-page-title">Minha Estante</h1>
            <div className="bookshelf-page-main" ref={gridContainerRef}>
                {isLoading ? (
                    <BookshelfSkeleton />
                ) : activeFilter === "updates" ? (
                    reviews.length === 0 ? (
                        <BookshelfEmptyState />
                    ) : (
                        <ReviewViewer
                            reviews={reviewViewerItems}
                            title="Atualizações de leitura"
                            onEditReview={(review) => handleEditReview(review.id)}
                            canEditReview={() => true}
                        />
                    )
                ) : activeFilter === "reviews" ? (
                    reviews.length === 0 ? (
                        <BookshelfEmptyState />
                    ) : (
                        <ReviewViewer
                            reviews={reviewViewerItems}
                            onEditReview={(review) => handleEditReview(review.id)}
                            canEditReview={(review) => Boolean(user?.id && review.userId === user.id)}
                        />
                    )
                ) : books.length === 0 ? (
                    <BookshelfEmptyState />
                ) : (
                    <>
                        <div className="bookshelf-page-grid">
                            {visibleBooks.map((book) => (
                                <BookCard
                                    key={book.bookId}
                                    bookId={book.bookId}
                                    bookTitle={book.bookTitle}
                                    bookAuthors={book.bookAuthors}
                                    bookCoverImage={book.bookCoverImage}
                                    shelfStatus={book.shelfStatus}
                                    userRating={book.userRating}
                                    currentPage={book.currentPage}
                                    bookPageCount={book.bookPageCount}
                                    onRemove={handleRemoveBook}
                                />
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}

                {showEditReview && editingReview && (
                    <AddReview
                        onClose={() => {
                            setShowEditReview(false);
                            setEditingReview(null);
                        }}
                        initialBook={{
                            bookId: editingReview.googleBooksId ?? "",
                            bookTitle: editingReview.bookTitle ?? "Título desconhecido",
                            bookAuthors: editingReview.bookAuthors ?? [],
                            bookCoverImage: editingReview.coverUrl ?? null,
                            bookPageCount: editingReview.bookPageCount ?? null,
                        }}
                        initialCategory={activeFilter === "updates" ? "reading" : undefined}
                        {...(activeFilter === "updates"
                            ? {
                                initialUpdate: {
                                    updateId: Number(editingReview.id),
                                    currentPage: editingReview.currentPage ?? null,
                                    percentage: editingReview.percentage ?? null,
                                    comment: editingReview.text,
                                    reaction: editingReview.reaction ?? null,
                                    hasSpoiler: editingReview.isSpoiler ?? false,
                                },
                            }
                            : {
                                initialReview: {
                                    reviewId: Number(editingReview.id),
                                    rating: editingReview.rating,
                                    content: editingReview.text,
                                    hasSpoiler: editingReview.isSpoiler,
                                    createdAt: editingReview.date ?? null,
                                },
                            }
                        )}
                        onSaved={async () => {
                            setShowEditReview(false);
                            setEditingReview(null);
                            if (activeFilter === "reviews" || activeFilter === "updates") {
                                setIsLoading(true);
                                await loadBookshelf(activeFilter);
                            }
                        }}
                    />
                )}

                <AnimatePresence>
                    {bookToRemove && (
                        <RemoveBookModal
                            bookTitle={bookToRemove.bookTitle}
                            bookCoverImage={bookToRemove.bookCoverImage}
                            isRemoving={isRemoving}
                            onConfirm={handleConfirmRemove}
                            onClose={() => setBookToRemove(null)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
