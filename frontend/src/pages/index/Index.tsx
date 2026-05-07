import "../../assets/css/index/index.scss";
import { useEffect, useState } from "react";
import { ReviewViewer } from "../../components/reviewviewer/ReviewViewer";
import { FeedSidebar } from "../../components/feedSidebar/FeedSidebar";
import { fetchAllReviews, type ReviewData } from "../../services/reviews.service";
import { fetchAllReadingUpdates } from "../../services/readingUpdates.service";
import { toggleReviewLike, toggleUpdateLike } from "../../services/likes.service";
import { useAuth } from "../../contexts/auth.context";
import AddReview from "../../components/addreview/AddReview";
import { fetchBookStatus } from "../../services/bookshelf.service";
import type { ShelfStatus } from "../../types/bookshelf";

function mapUpdatesToReviewData(items: any[], user?: { id?: number; nickname?: string; avatarUrl?: string | null } | null): ReviewData[] {
    return items.map((u) => ({
        id: `update-${u.id}`,
        userId: user?.id,
        author: user?.nickname ?? "",
        authorAvatar: user?.avatarUrl ?? null,
        rating: 0,
        text: u.comment,
        date: u.createdAt,
        isSpoiler: u.hasSpoiler,
        bookTitle: u.bookTitle,
        coverUrl: u.bookCoverImage,
        googleBooksId: u.googleBooksId,
        bookAuthors: u.bookAuthors,
        bookPageCount: u.bookPageCount,
        currentPage: u.currentPage,
        percentage: u.percentage,
        reaction: u.reaction,
        likeCount: u.likeCount ?? 0,
        isLikedByMe: u.isLiked ?? false
    }));
}

async function fetchFeedPage(page: number, pageSize: number, user?: any): Promise<{ items: ReviewData[]; hasMore: boolean }> {
    const [reviewsRes, updatesRes] = await Promise.all([
        fetchAllReviews(page, pageSize),
        page === 1 ? fetchAllReadingUpdates(1, 100) : Promise.resolve(null),
    ]);

    const reviewItems: ReviewData[] = reviewsRes.success ? (reviewsRes.data || []) : [];
    const updateItems: ReviewData[] = (updatesRes && updatesRes.success)
        ? mapUpdatesToReviewData(updatesRes.data.items, user)
        : [];

    if (page === 1) {
        const merged = [...reviewItems, ...updateItems];
        merged.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
        return { items: merged, hasMore: reviewItems.length >= pageSize };
    }

    return { items: reviewItems, hasMore: reviewItems.length >= pageSize };
}

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

        async function loadInitial() {
            setLoading(true);
            setError(null);

            const result = await fetchFeedPage(1, pageSize, user);

            if (!active) return;

            setReviews(result.items);
            if (!result.hasMore && result.items.length < pageSize * 2) {
                setFinished(true);
            }

            setLoading(false);
        }

        loadInitial();

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

    const handleToggleLike = async (id: string) => {
        const isUpdate = id.startsWith("update-");
        const realId = isUpdate ? id.replace("update-", "") : id;

        setReviews((prev) =>
            prev.map((r) =>
                r.id === id
                    ? { ...r, isLikedByMe: !r.isLikedByMe, likeCount: (r.likeCount ?? 0) + (r.isLikedByMe ? -1 : 1) }
                    : r
            )
        );

        const result = isUpdate
            ? await toggleUpdateLike(realId)
            : await toggleReviewLike(realId);

        if (result.success) {
            setReviews((prev) =>
                prev.map((r) =>
                    r.id === id
                        ? { ...r, isLikedByMe: result.data.liked, likeCount: result.data.likeCount }
                        : r
                )
            );
        }
    };

    return (
        <div className="index-page">
            <div className="index-page-wrapper">
                <FeedSidebar variant="personal" refreshToken={sidebarRefreshToken} />
                <div className="index-page-content">
                    <section className="index-page-feed" aria-label="Feed de atividades recentes">
                        {error ? (
                            <p className="index-page-error">{error}</p>
                        ) : (
                            <>
                                <ReviewViewer
                                    reviews={reviews}
                                    title="Feed"
                                    onEditReview={(review) => handleEditReview(review.id)}
                                    canEditReview={(review) =>
                                        Boolean(user?.id && review.userId === user.id) && !review.id.startsWith("update-")
                                    }
                                    onToggleLike={handleToggleLike}
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
                                            const result = await fetchFeedPage(1, pageSize, user);
                                            setReviews(result.items);
                                            setPage(1);
                                            setFinished(!result.hasMore && result.items.length < pageSize * 2);
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
                        const result = await fetchFeedPage(1, pageSize, user);
                        setReviews(result.items);
                        setPage(1);
                        setFinished(!result.hasMore && result.items.length < pageSize * 2);
                        setLoading(false);
                    }}
                />
            )}

        </div>
    );
}
