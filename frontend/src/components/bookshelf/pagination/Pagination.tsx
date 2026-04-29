import "./Pagination.scss";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = getPageNumbers(currentPage, totalPages);

    return (
        <nav className="pagination">
            <button
                className="pagination-arrow"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <span className="material-icons">chevron_left</span>
            </button>

            {pages.map((page, index) =>
                page === "..." ? (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                    <button
                        key={page}
                        className={`pagination-number ${page === currentPage ? "pagination-number-active" : ""}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                className="pagination-arrow"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <span className="material-icons">chevron_right</span>
            </button>
        </nav>
    );
}
