import "../../assets/css/index/index.scss";
import { useEffect, useState } from "react";
import { ReviewViewer } from "../../components/reviewviewer/ReviewViewer";
import { FeedSidebar } from "../../components/feedSidebar/FeedSidebar";
import { fetchAllReviews, type ReviewData } from "../../services/reviews.service";
import { useAuth } from "../../contexts/auth.context";
import AddReview from "../../components/addreview/AddReview";
import { fetchBookStatus } from "../../services/bookshelf.service";
import type { ShelfStatus } from "../../types/bookshelf";

export function IndexPage() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 4;
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [finished, setFinished] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showEditReview, setShowEditReview] = useState(false);
    const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
    const [showCreateReview, setShowCreateReview] = useState(false);
    const [editInitialCategory, setEditInitialCategory] = useState<ShelfStatus | null>(null);
    const [sidebarRefreshToken, setSidebarRefreshToken] = useState(0);

    useEffect(() => {
        let active = true;

        async function loadPage(p: number, append = false) {
            if (!append) {
                setLoading(true);
                setError(null);
            } else {
                setIsLoadingMore(true);
            }

            const result = await fetchAllReviews(p, pageSize);

            if (!active) return;

            if (!result.success) {
                setError(result.error);
                if (!append) setReviews([]);
                setLoading(false);
                setIsLoadingMore(false);
                return;
            }

            const items = result.data || [];
            if (append) {
                setReviews((prev) => [...prev, ...items]);
            } else {
                setReviews(items);
            }

            if (items.length < pageSize) {
                setFinished(true);
            }

            setLoading(false);
            setIsLoadingMore(false);
        }

        loadPage(1, false);

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let ticking = false;

        async function loadMore() {
            if (loading || isLoadingMore || finished) return;
            setIsLoadingMore(true);

            const minDelay = new Promise((res) => setTimeout(res, 600));
            const nextPage = page + 1;
            const fetchPromise = fetchAllReviews(nextPage, pageSize);

            const [result] = await Promise.all([fetchPromise, minDelay]);

            if (!result.success) {
                setError(result.error);
                setIsLoadingMore(false);
                return;
            }

            const items = result.data || [];
            setReviews((prev) => [...prev, ...items]);
            setPage(nextPage);
            if (items.length < pageSize) setFinished(true);
            setIsLoadingMore(false);
        }

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
                if (nearBottom) loadMore();
                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [page, loading, isLoadingMore, finished]);

    const handleEditReview = async (reviewId: string) => {
        const selected = reviews.find((review) => review.id === reviewId);
        if (!selected) return;

        try {
            const statusResp = await fetchBookStatus(selected.googleBooksId ?? "");
            if (statusResp && statusResp.success) {
                setEditInitialCategory(statusResp.data?.shelfStatus ?? null);
            } else {
                setEditInitialCategory(null);
            }
        } catch {
            setEditInitialCategory(null);
        }

        setEditingReview(selected);
        setShowEditReview(true);
    };

    const refreshSidebar = () => {
        setSidebarRefreshToken((value) => value + 1);
    };

    return (
        <div className="index-page">
            <div className="index-page-wrapper">
                <FeedSidebar variant="personal" refreshToken={sidebarRefreshToken} />
                <div className="index-page-content">
                    <section className="index-page-feed" aria-label="Feed de resenhas recentes">
                        {error ? (
                            <p className="index-page-error">{error}</p>
                        ) : (
                            <>
                                <ReviewViewer
                                    reviews={reviews}
                                    title="Feed de resenhas"
                                    onEditReview={(review) => handleEditReview(review.id)}
                                    canEditReview={(review) => Boolean(user?.id && review.userId === user.id)}
                                />
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
                                            bookPageCount: editingReview.bookPageCount ?? null
                                        }}
                                        initialReview={{
                                            reviewId: Number(editingReview.id),
                                            rating: editingReview.rating,
                                            content: editingReview.text,
                                            hasSpoiler: editingReview.isSpoiler,
                                            createdAt: editingReview.date ?? null
                                        }}
                                        initialCategory={editInitialCategory}
                                        onSaved={async () => {
                                            setShowEditReview(false);
                                            setEditingReview(null);
                                            refreshSidebar();
                                            setLoading(true);
                                            const result = await fetchAllReviews(1, pageSize);
                                            if (result.success) {
                                                setReviews(result.data || []);
                                                setPage(1);
                                                setFinished((result.data || []).length < pageSize);
                                            }
                                            setLoading(false);
                                        }}
                                    />
                                )}
                                <div className="index-feed-footer">
                                    {isLoadingMore && (
                                        <div className="loader" aria-hidden>
                                            <div className="loader-spinner" />
                                            <div className="loader-label">Carregando...</div>
                                        </div>
                                    )}
                                    {!isLoadingMore && finished && (
                                        <div className="feed-end">Você está atualizado.</div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </div>

                <FeedSidebar variant="general" refreshToken={sidebarRefreshToken} />
            </div>
            <button
                type="button"
                className="fab-create-review"
                aria-label="Escrever resenha"
                onClick={() => setShowCreateReview(true)}
            >
                <span className="material-icons">add</span>
            </button>

            {showCreateReview && (
                <AddReview
                    onClose={() => setShowCreateReview(false)}
                    onSaved={async () => {
                        setShowCreateReview(false);
                        refreshSidebar();
                        setLoading(true);
                        const result = await fetchAllReviews(1, pageSize);
                        if (result.success) {
                            setReviews(result.data || []);
                            setPage(1);
                            setFinished((result.data || []).length < pageSize);
                        }
                        setLoading(false);
                    }}
                />
            )}

            {isLoadingMore && (
                <div className="loader-fixed" aria-hidden>
                    <div className="loader-spinner" />
                </div>
            )}
        </div>
    );
}
