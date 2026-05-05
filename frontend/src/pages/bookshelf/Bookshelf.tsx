import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { flushSync } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { BookCard } from "../../components/bookshelf/bookCard/BookCard";
import { PageCounter } from "../../components/bookshelf/pageCounter/PageCounter";
import { BookshelfSidebar } from "../../components/bookshelf/bookshelfSidebar/BookshelfSidebar";
import { Pagination } from "../../components/bookshelf/pagination/Pagination";
import { BookshelfEmptyState } from "../../components/bookshelf/emptyState/BookshelfEmptyState";
import { fetchBookshelf, removeBookFromShelf } from "../../services/bookshelf.service";
import { fetchRecentReviews } from "../../services/reviews.service";
import type { ReviewData } from "../../services/reviews.service";
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
    if (filter === "reviews") {
        return "reviews";
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
        if (filter === "reviews") {
            if (!user?.id) {
                setReviews([]);
                setBooks([]);
                setIsLoading(false);
                return;
            }

            const res = await fetchRecentReviews(user.id, undefined, 10);
            if (res.success) {
                setBooks([]);
                setFilterCounts((prev) => prev);
                setTotalPagesRead(0);
                setReviews(res.data || []);
            } else {
                showAlert("danger", "Erro ao carregar resenhas.");
            }
            setIsLoading(false);
            return;
        }

        const result = await fetchBookshelf(filter);

        if (result.success) {
            setBooks(result.data.books);
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
            const result = activeFilter === "reviews"
                ? null
                : await fetchBookshelf(activeFilter);

            if (cancelled) return;

            if (activeFilter === "reviews") {
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
                    setFilterCounts((prev) => prev);
                    setTotalPagesRead(0);
                    setReviews(res.data || []);
                }
                setIsLoading(false);
                return;
            }

            if (result?.success) {
                setBooks(result.data.books);
                setFilterCounts(result.data.filterCounts);
                setTotalPagesRead(result.data.totalPagesRead);
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
                {isLoading ? null : activeFilter === "reviews" ? (
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
                        initialReview={{
                            reviewId: Number(editingReview.id),
                            rating: editingReview.rating,
                            content: editingReview.text,
                            hasSpoiler: editingReview.isSpoiler,
                            createdAt: editingReview.date ?? null,
                        }}
                        onSaved={async () => {
                            setShowEditReview(false);
                            setEditingReview(null);
                            if (activeFilter === "reviews") {
                                setIsLoading(true);
                                await loadBookshelf("reviews");
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
}
