import { Link } from "react-router-dom";
import type { ShelfStatus } from "../../../types/bookshelf";
import { ShelfStatusBadgeColor, SHELF_STATUS_LABEL } from "../../../types/bookshelf";

interface BookCardProps {
    bookId: string;
    bookTitle: string;
    bookAuthors: string[];
    bookCoverImage: string | null;
    shelfStatus: ShelfStatus;
    userRating: number;
}

export function BookCard({
    bookId,
    bookTitle,
    bookAuthors,
    bookCoverImage,
    shelfStatus,
    userRating,
}: BookCardProps) {
    const badgeColor = ShelfStatusBadgeColor[shelfStatus];
    const badgeLabel = SHELF_STATUS_LABEL[shelfStatus];
    const bookDetailPath = `/book/${bookId}`;

    return (
        <div className="book-card">
            <Link to={bookDetailPath} className="book-card-cover-wrapper">
                <img
                    className="book-card-cover-image"
                    src={bookCoverImage ?? "https://picsum.photos/seed/placeholder/200/300"}
                    alt={`Capa de ${bookTitle}`}
                />
                <span
                    className="book-card-status-badge"
                    style={{ backgroundColor: badgeColor }}
                >
                    {badgeLabel}
                </span>
            </Link>
            <Link to={bookDetailPath} className="book-card-title">{bookTitle}</Link>
            <p className="book-card-authors">{bookAuthors.join(", ")}</p>
        </div>
    );
}
