import { Link } from "react-router-dom";
import type { ShelfStatus } from "../../../types/bookshelf";
import { ShelfStatusBadgeColor, SHELF_STATUS_LABEL } from "../../../types/bookshelf";
import "./BookCard.scss";

interface BookCardProps {
    bookId: string;
    bookTitle: string;
    bookAuthors: string[];
    bookCoverImage: string | null;
    shelfStatus: ShelfStatus;
    userRating: number;
    onRemove: (bookId: string) => void;
}

function renderStars(rating: number) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const stars: React.ReactNode[] = [];

    for (let i = 0; i < fullStars; i++) {
        stars.push(
            <span key={`full-${i}`} className="material-icons book-card-star">star</span>
        );
    }
    if (hasHalfStar) {
        stars.push(
            <span key="half" className="material-icons book-card-star">star_half</span>
        );
    }
    for (let i = 0; i < emptyStars; i++) {
        stars.push(
            <span key={`empty-${i}`} className="material-icons book-card-star book-card-star-empty">star_border</span>
        );
    }

    return <span className="book-card-stars">{stars}</span>;
}

export function BookCard({ bookId, bookTitle, bookAuthors, bookCoverImage, shelfStatus, userRating }: BookCardProps) {
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
                <button
                    className="book-card-remove-button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                >
                    <span className="material-symbols-outlined">bookmark_remove</span>
                </button>
                <span
                    className="book-card-status-badge"
                    style={{ backgroundColor: badgeColor }}
                >
                    {badgeLabel}
                </span>
            </Link>
            <Link to={bookDetailPath} className="book-card-title">{bookTitle}</Link>
            <p className="book-card-authors">{bookAuthors.join(", ")}</p>
            {userRating > 0 && renderStars(userRating)}
        </div>
    );
}
