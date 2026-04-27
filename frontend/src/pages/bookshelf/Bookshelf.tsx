import { useState } from "react";
import { BookCard } from "../../components/bookshelf/bookCard/BookCard";
import { PageCounter } from "../../components/bookshelf/pageCounter/PageCounter";
import { BookshelfSidebar } from "../../components/bookshelf/bookshelfSidebar/BookshelfSidebar";
import { Pagination } from "../../components/bookshelf/pagination/Pagination";
import { BOOKSHELF_MOCK_DATA } from "../../assets/mocks/bookshelfMockData";
import type { BookshelfFilter } from "../../types/bookshelf";
import { ShelfStatus as ShelfStatusValues } from "../../types/bookshelf";
import "./Bookshelf.scss";

const BOOKS_PER_PAGE = 40;

export function BookshelfPage() {
    const [activeFilter, setActiveFilter] = useState<BookshelfFilter | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

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

    const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    const paginatedBooks = filteredBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);

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
                <div className="bookshelf-page-main">
                    <div className="bookshelf-page-grid">
                        {paginatedBooks.map((book) => (
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
