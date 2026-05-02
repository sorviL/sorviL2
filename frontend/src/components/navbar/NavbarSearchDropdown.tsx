import type { FC } from "react";
import type { NavbarSearchResult } from "./navbar.types";

interface NavbarSearchDropdownProps {
    isVisible: boolean;
    isSearching: boolean;
    searchError: string | null;
    searchResults: NavbarSearchResult[];
    onBookSelect: (bookId: string) => void;
}

export const NavbarSearchDropdown: FC<NavbarSearchDropdownProps> = ({
    isVisible,
    isSearching,
    searchError,
    searchResults,
    onBookSelect
}) => {
    const shouldShowSearchError = import.meta.env.DEV && Boolean(searchError);

    const formatAuthors = (authors: string[]) => {
        if (authors.length === 0) {
            return "Escritor não informado";
        }

        return authors.join(", ");
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="navbar-search-dropdown" role="listbox" aria-label="Resultados da busca">
            {isSearching && <p className="navbar-search-feedback">Buscando livros...</p>}

            {!isSearching && shouldShowSearchError && (
                <p className="navbar-search-feedback navbar-search-feedback-error">{searchError}</p>
            )}

            {!isSearching && !shouldShowSearchError && searchResults.length === 0 && (
                <p className="navbar-search-feedback">Nenhum livro encontrado.</p>
            )}

            {searchResults.length > 0 && (
                <div className="navbar-search-results-list">
                    {searchResults.map((book) => (
                        <button
                            key={book.bookId}
                            type="button"
                            className="navbar-search-result"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => onBookSelect(book.bookId)}
                        >
                            {book.bookCoverImage ? (
                                <img
                                    src={book.bookCoverImage}
                                    alt={`Capa de ${book.bookTitle ?? "livro"}`}
                                    className="navbar-search-result-cover"
                                />
                            ) : (
                                <div
                                    className="navbar-search-result-cover navbar-search-result-cover-placeholder"
                                    aria-hidden="true"
                                >
                                    <span className="material-icons">auto_stories</span>
                                </div>
                            )}

                            <span className="navbar-search-result-info">
                                <span className="navbar-search-result-title">
                                    {book.bookTitle ?? "Livro sem título"}
                                </span>
                                {(book.bookAuthors.length > 0 || book.bookPublishedYear) && (
                                    <span className="navbar-search-result-meta">
                                        {formatAuthors(book.bookAuthors)}
                                        {book.bookPublishedYear ? ` • ${book.bookPublishedYear}` : ""}
                                    </span>
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
