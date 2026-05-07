import { useState } from "react";
import { Link } from "react-router-dom";
import type { ReviewData } from "../../services/reviews.service";
import { ProgressBar } from "../progressBar/ProgressBar";
import "./ReviewViewer.scss";

const REACTION_EMOJIS: Record<string, string> = {
  amei: "🥰",
  feliz: "😄",
  triste: "😢",
  medo: "😨",
  raiva: "😡",
  nojo: "🤢",
  cocô: "💩",
};

type Props = {
    reviews: ReviewData[];
    className?: string;
    title?: string;
    onEditReview?: (review: ReviewData) => void;
    canEditReview?: (review: ReviewData) => boolean;
    onToggleLike?: (id: string) => void;
};

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

function renderStars(rating: number) {
    const clamped = Math.max(0, Math.min(5, rating));
    const rounded = Math.round(clamped * 2) / 2;
    const fullStars = Math.floor(rounded);
    const hasHalf = rounded - fullStars === 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    const stars: React.ReactNode[] = [];
    for (let i = 0; i < fullStars; i++) {
        stars.push(
            <span key={`full-${i}`} className="rv-star is-filled material-icons" aria-hidden>
                star
            </span>
        );
    }
    if (hasHalf) {
        stars.push(
            <span key="half" className="rv-star is-half material-icons" aria-hidden>
                star_half
            </span>
        );
    }
    for (let i = 0; i < emptyStars; i++) {
        stars.push(
            <span key={`empty-${i}`} className="rv-star is-empty material-icons" aria-hidden>
                star_border
            </span>
        );
    }

    return <>{stars}</>;
}

export function ReviewViewer({ reviews, className, title = "Avaliações recentes", onEditReview, canEditReview, onToggleLike }: Props) {
    const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

    const handleRevealSpoiler = (reviewId: string) => {
        setRevealedSpoilers((prev) => {
            const next = new Set(prev);
            next.add(reviewId);
            return next;
        });
    };

    return (
        <div className={`review-viewer ${className ?? ""}`}>
            <h3 className="rv-title">{title}</h3>

            {reviews.length === 0 ? (
                <p className="rv-no">Nenhuma atividade ainda</p>
            ) : (
                <ul className="rv-list">
                    {reviews.map((r) => {
                        const cover = r.coverUrl ?? "https://via.placeholder.com/120x160?text=Sem+Capa";
                        const bookTitle = r.bookTitle ?? "Título desconhecido";
                        const bookPath = r.googleBooksId ? `/book/${r.googleBooksId}` : null;
                        const isSpoiler = Boolean(r.isSpoiler) && !revealedSpoilers.has(r.id);

                        return (
                            <li key={r.id} className="rv-item">
                                <div className="rv-item-main">
                                    {(r.author || onEditReview) && (
                                        <div className="rv-item-header">
                                            {r.author && (
                                                <div className="rv-author-block">
                                                    <img 
                                                        src={r.authorAvatar || "/images/no-photo.png"} 
                                                        alt={r.author} 
                                                        className="rv-author-avatar"
                                                        onError={(e) => { e.currentTarget.src = "/images/no-photo.png"; }}
                                                    />
                                                    <strong className="rv-author">{r.author}</strong>
                                                </div>
                                            )}
                                            {onEditReview && (canEditReview ? canEditReview(r) : true) && (
                                                <button
                                                    type="button"
                                                    className="rv-edit-btn"
                                                    onClick={() => onEditReview(r)}
                                                >
                                                    Editar
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className={`rv-content-spoiler${isSpoiler ? " is-spoiler" : ""}`}>
                                        <div className="rv-text-wrap">
                                            {r.reaction && <span className="rv-reaction">{REACTION_EMOJIS[r.reaction] ?? r.reaction}</span>}
                                            <p className="rv-text">{r.text}</p>
                                        </div>

                                    {(r.currentPage != null || r.percentage != null) ? (
                                        <div className="rv-progress-wrap">
                                            <div className="rv-progress-header">
                                                <span className="rv-page-info">
                                                    {r.currentPage && r.bookPageCount && r.bookPageCount > 0
                                                        ? `${r.currentPage} de ${r.bookPageCount}`
                                                        : r.percentage != null ? `${r.percentage}%` : ""}
                                                </span>
                                                {r.date && <span className="rv-date">{formatRelativeDate(r.date)}</span>}
                                            </div>
                                            <ProgressBar
                                                currentPage={r.currentPage ?? 0}
                                                totalPages={r.bookPageCount ?? 0}
                                                percentage={r.percentage ?? undefined}
                                                mini
                                            />
                                        </div>
                                    ) : (
                                        <div className="rv-meta-left">
                                            <div className="rv-rating-left" aria-hidden>
                                                {renderStars(r.rating)}
                                            </div>
                                            <div className="rv-meta-bottom">
                                                {r.date && <span className="rv-date">Postado {formatRelativeDate(r.date)}</span>}
                                                {r.isFavorite && (
                                                    <span className="rv-favorite-badge">
                                                        <span className="material-icons">favorite</span>
                                                        Favoritado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                        {onToggleLike && (
                                            <div className="rv-like-row">
                                                <button
                                                    type="button"
                                                    className={`rv-like-btn ${r.isLikedByMe ? "rv-liked" : ""}`}
                                                    onClick={() => onToggleLike(r.id)}
                                                >
                                                    <span className="material-icons">{r.isLikedByMe ? "favorite" : "favorite_border"}</span>
                                                </button>
                                                <span className="rv-like-count">{r.likeCount ?? 0}</span>
                                            </div>
                                        )}

                                        {isSpoiler && (
                                            <button
                                                type="button"
                                                className="rv-spoiler-overlay"
                                                onClick={() => handleRevealSpoiler(r.id)}
                                                aria-label={`Revelar spoiler da review de ${title}`}
                                            >
                                                <div className="rv-skeleton-line" style={{ width: '85%' }} />
                                                <div className="rv-skeleton-line" style={{ width: '50%' }} />
                                                <div className="rv-skeleton-line" style={{ width: '30%' }} />
                                                <div className="rv-skeleton-line" style={{ width: '88%' }} />
                                                <div className="rv-skeleton-line" style={{ width: '76%' }} />
                                                <div className="rv-skeleton-line" style={{ width: '40%' }} />
                                                <span className="rv-spoiler-label">
                                                    <svg className="rv-spoiler-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                                                    </svg>
                                                    SPOILER
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="rv-item-side">
                                    {bookPath ? (
                                        <Link to={bookPath} className="rv-book-link" aria-label={`Abrir página do livro ${bookTitle}`}>
                                            <div className="rv-cover">
                                                <img
                                                    src={cover}
                                                    alt={bookTitle}
                                                    onError={(e) => { e.currentTarget.src = "/images/no-cover.png"; }}
                                                />
                                            </div>
                                            <div className="rv-cover-title">{bookTitle}</div>
                                        </Link>
                                    ) : (
                                        <>
                                            <div className="rv-cover">
                                                <img
                                                    src={cover}
                                                    alt={bookTitle}
                                                    onError={(e) => { e.currentTarget.src = "/images/no-cover.png"; }}
                                                />
                                            </div>
                                            <div className="rv-cover-title">{bookTitle}</div>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
