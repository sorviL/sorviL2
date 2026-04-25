import { BookCard } from "../../components/bookshelf/bookCard/BookCard";
import { BOOKSHELF_MOCK_DATA } from "../../assets/mocks/bookshelfMockData";
import "./Bookshelf.scss";

export function BookshelfPage() {
    return (
        <div className="bookshelf-page">
            <h1 className="bookshelf-page-title">Minha Estante</h1>
            <div className="bookshelf-page-grid">
                {BOOKSHELF_MOCK_DATA.map((book) => (
                    <BookCard
                        key={book.bookId}
                        bookId={book.bookId}
                        bookTitle={book.bookTitle}
                        bookAuthors={book.bookAuthors}
                        bookCoverImage={book.bookCoverImage}
                        shelfStatus={book.shelfStatus}
                        userRating={book.userRating}
                        onRemove={(id) => console.log("Remover livro:", id)}
                    />
                ))}
            </div>
        </div>
    );
}
