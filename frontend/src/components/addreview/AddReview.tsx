import React, { useEffect, useRef, useState } from "react";
import { GoogleBooksAPIController } from "../../assets/javascript/googleBooks/GoogleBooksAPIController";
import { createReview } from "../../services/reviews.service";
import type { ShelfStatus } from "../../types/bookshelf";
import './AddReview.scss';

type ReviewBook = {
  readonly bookId: string;
  readonly bookTitle: string;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly bookPageCount: number | null;
};

type Props = {
  onClose: () => void;
  initialBook?: ReviewBook;
  onSaved?: (status: { inShelf: boolean; hasReview: boolean }) => void;
};

type SearchBook = {
  readonly bookId: string;
  readonly bookTitle: string | null;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
};

const CATEGORIES: { value: ShelfStatus; label: string }[] = [
  { value: "reading", label: "Lendo" },
  { value: "wantToRead", label: "Quero Ler" },
  { value: "read", label: "Lido" },
  { value: "rereading", label: "Relendo" },
  { value: "abandoned", label: "Abandonado" },
];

function isShelfStatus(value: string): value is ShelfStatus {
  return CATEGORIES.some((category) => category.value === value);
}

const AddReview: React.FC<Props> = ({ onClose, initialBook, onSaved }) => {
  const googleBooksApiRef = useRef<GoogleBooksAPIController | null>(null);
  const searchRequestIdRef = useRef(0);
  const skipOpenRef = useRef(false);
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [body, setBody] = useState<string>("");
  const [category, setCategory] = useState<ShelfStatus>("read");
  const [hasSpoiler, setHasSpoiler] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<ReviewBook | null>(initialBook ?? null);
  const [searchQuery, setSearchQuery] = useState(initialBook?.bookTitle ?? "");
  const [searchResults, setSearchResults] = useState<SearchBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialBook) return;
    setSelectedBook(initialBook);
    setSearchQuery(initialBook.bookTitle);

    skipOpenRef.current = true;
    setIsSearchOpen(false);
    const clearSkip = window.setTimeout(() => { skipOpenRef.current = false; }, 600);
    return () => window.clearTimeout(clearSkip);
  }, [initialBook]);

  useEffect(() => {
    const normalizedQuery = searchQuery.trim();

    googleBooksApiRef.current?.cancelPendingSearch();

    if (!normalizedQuery) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      setIsSearchOpen(false);
      return;
    }

    if (skipOpenRef.current) {
      setIsSearchOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setIsSearchOpen(true);

    const currentRequestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = currentRequestId;

    const debounceId = window.setTimeout(async () => {
      try {
        if (!googleBooksApiRef.current) {
          googleBooksApiRef.current = new GoogleBooksAPIController();
        }

        const result = await googleBooksApiRef.current.quickSearch(normalizedQuery);

        if (searchRequestIdRef.current !== currentRequestId) {
          return;
        }

        setSearchResults((result?.books ?? []).slice(0, 5) as SearchBook[]);
      } catch {
        if (searchRequestIdRef.current !== currentRequestId) {
          return;
        }

        setSearchResults([]);
        setSearchError("Não foi possível buscar livros agora.");
      } finally {
        if (searchRequestIdRef.current === currentRequestId) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(debounceId);
      googleBooksApiRef.current?.cancelPendingSearch();
    };
  }, [searchQuery]);

  const handleBookSelect = (book: SearchBook) => {
    skipOpenRef.current = true;
    setSelectedBook({
      bookId: book.bookId,
      bookTitle: book.bookTitle ?? "Livro sem título",
      bookAuthors: book.bookAuthors,
      bookCoverImage: book.bookCoverImage,
      bookPageCount: null,
    });
    setSearchQuery(book.bookTitle ?? "");
    setIsSearchOpen(false);
    setSearchError(null);

    window.setTimeout(() => {
      skipOpenRef.current = false;
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="addreview-overlay" onClick={onClose}>
      <div className="addreview-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Escrever resenha</h3>

        <form className="addreview-form" onSubmit={handleSubmit}>
          <div className="addreview-grid">
            <div className="addreview-left">
              <div className="label">Livro</div>

              <div className="addreview-search-box">
                <input
                  className="addreview-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedBook(null);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim() && !skipOpenRef.current) {
                      setIsSearchOpen(true);
                    }
                  }}
                  placeholder="Busque por título do livro"
                  autoComplete="off"
                  spellCheck={false}
                />

                {isSearchOpen && (
                  <div className="addreview-book-dropdown" role="listbox" aria-label="Resultados da busca de livros">
                    {isSearching && <p className="addreview-book-feedback">Buscando livros...</p>}
                    {!isSearching && searchError && (
                      <p className="addreview-book-feedback addreview-book-feedback-error">{searchError}</p>
                    )}
                    {!isSearching && !searchError && searchResults.length === 0 && (
                      <p className="addreview-book-feedback">Nenhum livro encontrado.</p>
                    )}
                    {searchResults.length > 0 && (
                      <div className="addreview-book-results-list">
                        {searchResults.map((book) => (
                          <button
                            key={book.bookId}
                            type="button"
                            className="addreview-book-result"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleBookSelect(book)}
                          >
                            {book.bookCoverImage ? (
                              <img
                                src={book.bookCoverImage}
                                alt={`Capa de ${book.bookTitle ?? "livro"}`}
                                className="addreview-book-result-cover"
                              />
                            ) : (
                              <div className="addreview-book-result-cover addreview-book-result-cover-placeholder" aria-hidden="true">
                                <span className="material-icons">auto_stories</span>
                              </div>
                            )}
                            <span className="addreview-book-result-title">{book.bookTitle ?? "Livro sem título"}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="addreview-cover-large">
                {selectedBook && selectedBook.bookCoverImage ? (
                  <img src={selectedBook.bookCoverImage} alt={`Capa de ${selectedBook.bookTitle}`} />
                ) : (
                  <div className="addreview-cover-placeholder"><span className="material-icons">auto_stories</span></div>
                )}
              </div>

              <div className="addreview-selected-title">
                {selectedBook ? (
                  <>
                    <strong>{selectedBook.bookTitle}</strong>
                    <span>{selectedBook.bookAuthors.join(", ") || "Autor desconhecido"}</span>
                  </>
                ) : (
                  <span className="addreview-no-book">Nenhum livro selecionado</span>
                )}
              </div>
            </div>

            <div className="addreview-right">
              <label className="addreview-field">
                <div className="label">Avaliação</div>
                <div className="addreview-stars">
                  {Array.from({ length: 5 }, (_, i) => {
                    const val = i + 1;
                    const isActive = val <= (hover || rating);
                    return (
                      <span
                        key={val}
                        className={`material-icons addreview-star ${isActive ? 'active' : ''}`}
                        onClick={() => setRating(val)}
                        onMouseEnter={() => setHover(val)}
                        onMouseLeave={() => setHover(0)}
                      >
                        {isActive ? 'star' : 'star_border'}
                      </span>
                    );
                  })}
                </div>
              </label>

              <label className="addreview-field">
                <div className="label">Resenha</div>
                <textarea className="addreview-textarea" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
              </label>

              <label className="addreview-field">
                <div className="label">Categoria</div>
                <select className="addreview-select" value={category} onChange={(e) => {
                    if (isShelfStatus(e.target.value)) {
                      setCategory(e.target.value);
                    }
                  }}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </label>

              <label className="addreview-field">
                <div className="label">Contém spoiler</div>
                <div>
                  <input id="hasSpoiler" type="checkbox" checked={hasSpoiler} onChange={(e) => setHasSpoiler(e.target.checked)} />
                  <label htmlFor="hasSpoiler" style={{ marginLeft: 8 }}>Sim</label>
                </div>
              </label>

              {submitError && <p className="addreview-error">{submitError}</p>}

              <div className="addreview-actions">
                <button type="button" className="addreview-close" onClick={onClose} disabled={isSubmitting}>Fechar</button>
                <button type="submit" className="addreview-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReview;
