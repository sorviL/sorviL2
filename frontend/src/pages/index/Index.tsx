import "../../assets/css/index/index.scss";
import { useEffect, useState } from "react";
import { ReviewViewer } from "../../components/reviewviewer/ReviewViewer";
import { fetchRecentReviews, type ReviewData } from "../../services/reviews.service";
import { useAuth } from "../../contexts/auth.context";
import AddReview from "../../components/addreview/AddReview";

export function IndexPage() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEditReview, setShowEditReview] = useState(false);
    const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
    const [showCreateReview, setShowCreateReview] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadReviews() {
            setLoading(true);
            setError(null);

            const result = await fetchRecentReviews(undefined, undefined, 6);

            if (!active) {
                return;
            }

            if (!result.success) {
                setError(result.error);
                setReviews([]);
                setLoading(false);
                return;
            }

            setReviews(result.data);
            setLoading(false);
        }

        loadReviews();

        return () => {
            active = false;
        };
    }, []);

    const handleEditReview = (reviewId: string) => {
        const selected = reviews.find((review) => review.id === reviewId);
        if (!selected) return;
        setEditingReview(selected);
        setShowEditReview(true);
    };

    return (
        <div className="index-page">
            <div className="index-page-content">
                <section className="index-page-feed" aria-label="Feed de resenhas recentes">
                    {loading ? (
                        <p className="index-page-status">Carregando resenhas recentes...</p>
                    ) : error ? (
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
                                        bookPageCount: editingReview.bookPageCount ?? null,
                                    }}
                                    initialReview={{
                                        reviewId: Number(editingReview.id),
                                        rating: editingReview.rating,
                                        content: editingReview.text,
                                        hasSpoiler: editingReview.isSpoiler,
                                        createdAt: editingReview.date ?? null,
                                    }}
                                    onSaved={async () => {
                                        setShowEditReview(false);
                                        setEditingReview(null);
                                        setLoading(true);
                                        const result = await fetchRecentReviews(undefined, undefined, 6);
                                        if (result.success) {
                                            setReviews(result.data);
                                        }
                                        setLoading(false);
                                    }}
                                />
                            )}
                        </>
                    )}
                </section>
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
                        setLoading(true);
                        const result = await fetchRecentReviews(undefined, undefined, 6);
                        if (result.success) setReviews(result.data);
                        setLoading(false);
                    }}
                />
            )}
        </div>
    );
}
