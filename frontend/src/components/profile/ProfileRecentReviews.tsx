import { Link } from "react-router-dom";
import "../../assets/css/profile/profile-recent-reviews.scss";

const MOCK_RECENT_REVIEWS = [
    {
        id: "mock-review-1",
        bookTitle: "O Nome do Vento",
        bookAuthors: ["Patrick Rothfuss"],
        rating: 5,
        content: "Uma fantasia que te prende desde as primeiras páginas e não solta mais.",
        createdAt: "Há 1 dia",
    },
    {
        id: "mock-review-2",
        bookTitle: "Duna",
        bookAuthors: ["Frank Herbert"],
        rating: 5,
        content: "Construção de mundo absurda e uma história que cresce a cada capítulo.",
        createdAt: "Há 3 dias",
    },
    {
        id: "mock-review-3",
        bookTitle: "Neuromancer",
        bookAuthors: ["William Gibson"],
        rating: 4,
        content: "Ritmo intenso, visual forte e uma base que moldou o cyberpunk.",
        createdAt: "Na última semana",
    },
    {
        id: "mock-review-4",
        bookTitle: "Orgulho e Preconceito",
        bookAuthors: ["Jane Austen"],
        rating: 5,
        content: "Uma leitura leve por fora e muito afiada por dentro.",
        createdAt: "Na última semana",
    },
    {
        id: "mock-review-5",
        bookTitle: "A Guerra dos Tronos",
        bookAuthors: ["George R. R. Martin"],
        rating: 4,
        content: "Política, personagens fortes e reviravoltas no ponto certo.",
        createdAt: "Há 10 dias",
    },
];

function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, index) => (
        <span
            key={index}
            className={index < rating ? "material-icons profile-recent-review-star" : "material-icons profile-recent-review-star profile-recent-review-star-empty"}
        >
            {index < rating ? "star" : "star_border"}
        </span>
    ));
}

export function ProfileRecentReviews() {
    return (
        <section className="profile-recent-reviews" aria-label="Últimas resenhas do usuário">
            <div className="profile-recent-reviews-header">
                <div>
                    <h2 className="profile-recent-reviews-title">Suas últimas resenhas</h2>
                </div>
                <div className="profile-recent-reviews-actions">
                    <span className="profile-recent-reviews-count">5 resenhas</span>
                    <Link to="/bookshelf?filter=reviews" className="profile-recent-reviews-more">
                        Ver mais
                    </Link>
                </div>
            </div>

            <div className="profile-recent-reviews-grid">
                {MOCK_RECENT_REVIEWS.map((review) => (
                    <article className="profile-recent-review-card" key={review.id}>
                        <div className="profile-recent-review-rating" aria-label={`Avaliação de ${review.rating} estrelas`}>
                            {renderStars(review.rating)}
                        </div>

                        <div className="profile-recent-review-content">
                            <p className="profile-recent-review-added">Resenhado {review.createdAt}</p>
                            <h3 className="profile-recent-review-book-title">{review.bookTitle}</h3>
                            <p className="profile-recent-review-authors">{review.bookAuthors.join(", ")}</p>
                            <p className="profile-recent-review-excerpt">{review.content}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
