import { Link } from "react-router-dom";
import "../../assets/css/profile/profile-recent-books.scss";

const MOCK_RECENT_BOOKS = [
    {
        id: "mock-book-1",
        title: "O Nome do Vento",
        authors: ["Patrick Rothfuss"],
        coverUrl: "https://covers.openlibrary.org/b/id/8228691-L.jpg",
        addedAt: "Há 2 dias",
    },
    {
        id: "mock-book-2",
        title: "Duna",
        authors: ["Frank Herbert"],
        coverUrl: "https://covers.openlibrary.org/b/id/8101351-L.jpg",
        addedAt: "Há 4 dias",
    },
    {
        id: "mock-book-3",
        title: "A Guerra dos Tronos",
        authors: ["George R. R. Martin"],
        coverUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
        addedAt: "Na última semana",
    },
    {
        id: "mock-book-4",
        title: "Neuromancer",
        authors: ["William Gibson"],
        coverUrl: "https://covers.openlibrary.org/b/id/7884861-L.jpg",
        addedAt: "Na última semana",
    },
    {
        id: "mock-book-5",
        title: "Orgulho e Preconceito",
        authors: ["Jane Austen"],
        coverUrl: "https://covers.openlibrary.org/b/id/8231996-L.jpg",
        addedAt: "Há 10 dias",
    },
];

export function ProfileRecentBooks() {
    return (
        <section className="profile-recent-books" aria-label="Últimos livros adicionados na estante">
            <div className="profile-recent-books-header">
                <div>
                    <h2 className="profile-recent-books-title">Seus últimos livros adicionados</h2>
                </div>
                <div className="profile-recent-books-actions">
                    <span className="profile-recent-books-count">5 livros</span>
                    <Link to="/bookshelf" className="profile-recent-books-more">
                        Ver mais
                    </Link>
                </div>
            </div>

            <div className="profile-recent-books-grid">
                {MOCK_RECENT_BOOKS.map((book) => (
                    <article className="profile-recent-book-card" key={book.id}>
                        <div className="profile-recent-book-cover-wrap">
                            <img
                                className="profile-recent-book-cover"
                                src={book.coverUrl}
                                alt={`Capa de ${book.title}`}
                            />
                        </div>

                        <div className="profile-recent-book-content">
                            <p className="profile-recent-book-added">Adicionado {book.addedAt}</p>
                            <h3 className="profile-recent-book-title">{book.title}</h3>
                            <p className="profile-recent-book-authors">{book.authors.join(", ")}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
