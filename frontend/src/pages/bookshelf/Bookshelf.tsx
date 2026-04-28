import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { BookCard } from "../../components/bookshelf/bookCard/BookCard";
import { PageCounter } from "../../components/bookshelf/pageCounter/PageCounter";
import { BookshelfSidebar } from "../../components/bookshelf/bookshelfSidebar/BookshelfSidebar";
import { Pagination } from "../../components/bookshelf/pagination/Pagination";
import { BOOKSHELF_MOCK_DATA } from "../../assets/mocks/bookshelfMockData";
import type { BookshelfFilter } from "../../types/bookshelf";
import { ShelfStatus as ShelfStatusValues } from "../../types/bookshelf";
import "./Bookshelf.scss";

const BOOK_CARD_WIDTH = 135;
const BOOK_GRID_GAP = 24;
const VISIBLE_ROWS = 4;

function calculateBooksPerPage(gridContainerWidth: number): number {
    const columnsPerRow = Math.floor((gridContainerWidth + BOOK_GRID_GAP) / (BOOK_CARD_WIDTH + BOOK_GRID_GAP));
    return Math.max(columnsPerRow, 1) * VISIBLE_ROWS;
}

export function BookshelfPage() {
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const [booksPerPage, setBooksPerPage] = useState(VISIBLE_ROWS);
    const [activeFilter, setActiveFilter] = useState<BookshelfFilter | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

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
    }, []);

    function handleFilterChange(filter: BookshelfFilter | null) {
        setActiveFilter(filter);
        setCurrentPage(1);
    }

    const filteredBooks = activeFilter
        ? BOOKSHELF_MOCK_DATA.filter((book) => {
            if (activeFilter === "favorites") return book.isFavorite;
            if (activeFilter === "reviews") return book.hasReview;
            return book.shelfStatus === activeFilter;
        })
        : BOOKSHELF_MOCK_DATA;

    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const firstBookIndex = (currentPage - 1) * booksPerPage;
    const visibleBooks = filteredBooks.slice(firstBookIndex, firstBookIndex + booksPerPage);

    return (
        <div className="bookshelf-page">
            <h1 className="bookshelf-page-title">Minha Estante</h1>
            <div className="bookshelf-page-content">
                <aside className="bookshelf-page-sidebar">
                    <PageCounter totalPagesRead={getTotalPagesRead()} />
                    <BookshelfSidebar
                        activeFilter={activeFilter}
                        onFilterChange={handleFilterChange}
                    />
                </aside>
                <div className="bookshelf-page-main" ref={gridContainerRef}>
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
                                onRemove={(id) => console.log("Remover livro:", id)}
                            />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}

function getTotalPagesRead(): number {
    return BOOKSHELF_MOCK_DATA
        .filter((book) => book.shelfStatus === ShelfStatusValues.Read)
        .reduce((sum, book) => sum + book.bookPageCount, 0);
}
