import "../../assets/css/index/index.scss";
import { useEffect, useState } from "react";
import { ReviewViewer } from "../../components/reviewviewer/ReviewViewer";
import { fetchRecentReviews, type ReviewData } from "../../services/reviews.service";

export function IndexPage() {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="index-page">
            <div className="index-page-content">
                <section className="index-page-feed" aria-label="Feed de resenhas recentes">
                    {loading ? (
                        <p className="index-page-status">Carregando resenhas recentes...</p>
                    ) : error ? (
                        <p className="index-page-error">{error}</p>
                    ) : (
                        <ReviewViewer reviews={reviews} title="Feed de resenhas" />
                    )}
                </section>
            </div>
        </div>
    );
}
