import { Link } from "react-router-dom";
import { useEffect, useState, type ReactElement } from "react";
import "../../assets/css/profile/profile-recent-reviews.scss";
import { getRecentProfileReviews, type RecentProfileReview } from "../../services/profile.service";

const MAX_REVIEW_EXCERPT_LENGTH = 40;

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

function truncateExcerpt(content: string): string {
    if (content.length <= MAX_REVIEW_EXCERPT_LENGTH) {
        return content;
    }

    return `${content.slice(0, MAX_REVIEW_EXCERPT_LENGTH).trimEnd()}...`;
}

function renderStars(rating: number) {
    const clamped = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(clamped);
    const hasHalf = (clamped - fullStars) >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    const stars: ReactElement[] = [];
    for (let i = 0; i < fullStars; i++) stars.push(<span key={`full-${i}`} className="material-icons profile-recent-review-star">star</span>);
    if (hasHalf) stars.push(<span key="half" className="material-icons profile-recent-review-star">star_half</span>);
    for (let i = 0; i < emptyStars; i++) stars.push(<span key={`empty-${i}`} className="material-icons profile-recent-review-star profile-recent-review-star-empty">star_border</span>);

    return <>{stars}</>;
}

export function ProfileRecentReviews() {
    const [reviews, setReviews] = useState<RecentProfileReview[]>([]);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        async function loadReviews() {
            setIsLoading(true);
            const result = await getRecentProfileReviews();

            if (!isActive) {
                return;
            }

            if (!result.success) {
                setError(result.error);
                setReviews([]);
                setTotalReviews(0);
                setIsLoading(false);
                return;
            }

            setReviews(result.data.reviews);
            setTotalReviews(result.data.total);
            setError(null);
            setIsLoading(false);
        }

        void loadReviews();

        return () => {
            isActive = false;
        };
    }, []);

    const visibleReviews = reviews.slice(0, 5);

    return (
        <section className="profile-recent-reviews" aria-label="Últimas resenhas do usuário">
            <div className="profile-recent-reviews-header">
                <div>
                    <h2 className="profile-recent-reviews-title">Suas últimas resenhas</h2>
                </div>
                <div className="profile-recent-reviews-actions">
                    <span className="profile-recent-reviews-count">{totalReviews} resenhas</span>
                    <Link to="/bookshelf?filter=reviews" className="profile-recent-reviews-more">
                        Ver mais
                    </Link>
                </div>
            </div>

            <div className="profile-recent-reviews-grid">
                {isLoading && <p className="profile-recent-reviews-empty">Carregando suas resenhas mais recentes...</p>}
                {!isLoading && error && <p className="profile-recent-reviews-empty">{error}</p>}
                {!isLoading && !error && visibleReviews.length === 0 && (
                    <p className="profile-recent-reviews-empty">Você ainda não publicou resenhas.</p>
                )}
                {!isLoading && !error && visibleReviews.map((review) => (
                    <Link
                        key={review.reviewId}
                        to="/bookshelf?filter=reviews"
                        className="profile-recent-review-link"
                        aria-label={`Abrir resenhas da estante para ${review.bookTitle}`}
                    >
                        <article className="profile-recent-review-card">
                            <div className="profile-recent-review-rating" aria-label={`Avaliação de ${review.rating} estrelas`}>
                                {renderStars(review.rating)}
                            </div>

                            <div className="profile-recent-review-content">
                                <p className="profile-recent-review-added">Resenhado {formatRelativeDate(review.createdAt)}</p>
                                <h3 className="profile-recent-review-book-title">{review.bookTitle}</h3>
                                <p className="profile-recent-review-authors">{review.bookAuthors.join(", ")}</p>
                                <p className="profile-recent-review-excerpt">{truncateExcerpt(review.content)}</p>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </section>
    );
}
