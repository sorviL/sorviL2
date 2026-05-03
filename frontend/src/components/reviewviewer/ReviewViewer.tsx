import React, { useState } from "react";
import "./ReviewViewer.scss";

type Review = {
    id: string;
    author: string;
    rating: number;
    text: string;
    date?: string;
    coverUrl?: string;
    bookTitle?: string;
    isSpoiler?: boolean;
};

type Props = {
    reviews: Review[];
    className?: string;
};

export function ReviewViewer({ reviews, className }: Props) {
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
            <h3 className="rv-title">Avaliações</h3>

            {reviews.length === 0 ? (
                <p className="rv-no">Sem avaliações</p>
            ) : (
                <ul className="rv-list">
                    {reviews.map((r, index) => {
                        const cover = r.coverUrl ?? "https://books.google.com/books/publisher/content?id=q-y1EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73aTSR-hX3v2juWCyOYjAHKr1n-j7_u_DPbWJ85D-X8iqfV39Qfz0oQ8IJxNCSUzcuC-1TjdUSOkEfFDjsHniADWFwX9P6Vx6MV_L3nPhroDpsejq9lNqqpfgTewKUhyY8TiVnh&source=gbs_api";
                        const title = r.bookTitle ?? "Exemplo: O Alquimista";
                        const isSpoiler = (r.isSpoiler ?? index === 2) && !revealedSpoilers.has(r.id);

                        return (
                            <li key={r.id} className="rv-item">
                                <div className="rv-item-main">
                                    <div className="rv-item-header">
                                        <strong className="rv-author">{r.author}</strong>
                                    </div>

                                    <div className={`rv-content-spoiler${isSpoiler ? " is-spoiler" : ""}`}>
                                        <div className="rv-text-wrap">
                                            <p className="rv-text">{r.text}</p>
                                        </div>

                                        <div className="rv-meta-left">
                                            <div className="rv-rating-left" aria-hidden>
                                                {"★".repeat(Math.max(0, Math.min(5, r.rating)))}
                                            </div>
                                            {r.date && <div className="rv-date">{r.date}</div>}
                                        </div>

                                        {isSpoiler && (
                                            <button
                                                type="button"
                                                className="rv-spoiler-overlay"
                                                onClick={() => handleRevealSpoiler(r.id)}
                                                aria-label={`Revelar spoiler da review de ${title}`}
                                            >
                                                <span className="rv-spoiler-label">SPOILER</span>
                                                <span className="rv-spoiler-book">{title}</span>
                                                <span className="rv-spoiler-action"></span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="rv-item-side">
                                    <div className="rv-cover">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={cover} alt={title} />
                                    </div>
                                    <div className="rv-cover-title">{title}</div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
