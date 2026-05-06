import React, { useEffect, useRef, useState } from "react";
import { GoogleBooksAPIController } from "../../assets/javascript/googleBooks/GoogleBooksAPIController";
import { createReview, deleteReview } from "../../services/reviews.service";
import { fetchBookStatus, updateBookshelf } from "../../services/bookshelf.service";
import type { ShelfStatus } from "../../types/bookshelf";
import { useAlert } from "../alert/useAlert";
import { Button } from "../button/Button";
import './AddReview.scss';

type ReviewBook = {
  readonly bookId: string;
  readonly bookTitle: string;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly bookPageCount: number | null;
};

type ExistingReview = {
  readonly reviewId?: number | null;
  readonly rating?: number | null;
  readonly content?: string | null;
  readonly hasSpoiler?: boolean;
  readonly createdAt?: string | null;
  readonly readingStartDate?: string | null;
  readonly readingEndDate?: string | null;
};

type Props = {
  onClose: () => void;
  initialBook?: ReviewBook;
  initialReview?: ExistingReview | null;
  initialCategory?: ShelfStatus | null;
  onSaved?: (status: { inShelf: boolean; hasReview: boolean; shelfStatus?: ShelfStatus | null }) => void;
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

const AddReview: React.FC<Props> = ({ onClose, initialBook, initialReview, initialCategory, onSaved }) => {
  const { showAlert } = useAlert();
  const googleBooksApiRef = useRef<GoogleBooksAPIController | null>(null);
  const searchRequestIdRef = useRef(0);
  const skipOpenRef = useRef(false);
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [body, setBody] = useState<string>("");
  const [category, setCategory] = useState<ShelfStatus | null>(initialCategory ?? null);

  useEffect(() => {
    if (initialCategory !== undefined && initialCategory !== null) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);
  const [hasSpoiler, setHasSpoiler] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<ReviewBook | null>(initialBook ?? null);
  const [searchQuery, setSearchQuery] = useState(initialBook?.bookTitle ?? "");
  const [searchResults, setSearchResults] = useState<SearchBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userBookId, setUserBookId] = useState<number | null>(null);
  const [readingStartDate, setReadingStartDate] = useState("");
  const [readingEndDate, setReadingEndDate] = useState("");

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
    if (!initialReview) return;
    setRating(Number(initialReview.rating ?? 0));
    setBody(initialReview.content ?? "");
    setHasSpoiler(Boolean(initialReview.hasSpoiler));
    setReadingStartDate(initialReview.readingStartDate?.slice(0, 10) ?? "");
    setReadingEndDate(initialReview.readingEndDate?.slice(0, 10) ?? "");
  }, [initialReview]);

  useEffect(() => {
    if (!selectedBook) {
      setUserBookId(null);
      setIsFavorite(false);
      return;
    }
    let cancelled = false;
    fetchBookStatus(selectedBook.bookId).then((res) => {
      if (cancelled) return;
      if (res.success && res.data.inShelf) {
        setUserBookId(res.data.userBookId);
        setIsFavorite(res.data.isFavorite);
      }
    });
    return () => { cancelled = true; };
  }, [selectedBook]);

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

  const handleToggleFavorite = async () => {
    if (!userBookId) return;
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    const result = await updateBookshelf(userBookId, { isFavorite: newValue });
    if (!result.success) {
      setIsFavorite(!newValue);
      showAlert("danger", "Erro ao atualizar favorito.");
    }
  };

  const handleDeleteReview = async () => {
    const reviewId = initialReview?.reviewId;
    if (!reviewId) return;
    setIsSubmitting(true);
    const result = await deleteReview(reviewId);
    setIsSubmitting(false);
    if (!result.success) {
      showAlert("danger", "Erro ao excluir resenha.");
      return;
    }
    showAlert("success", "Resenha excluída com sucesso!");
    if (onSaved) {
      onSaved({ inShelf: true, hasReview: false, shelfStatus: category });
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedBook) {
      setSubmitError("Selecione um livro");
      return;
    }

    const trimmedBody = body.trim();
    const hasRating = Number(rating) > 0;
    const hasReviewText = trimmedBody.length > 0;

    if (!hasRating && !hasReviewText) {
    } else if (!(hasRating && hasReviewText)) {
      setSubmitError("Avalie e escreva a resenha.");
      return;
    }

    const finalCategory: ShelfStatus = category ?? "read";

    const payload: any = {
      book: {
        googleBooksId: selectedBook.bookId,
        title: selectedBook.bookTitle,
        authors: selectedBook.bookAuthors,
        coverUrl: selectedBook.bookCoverImage,
        pageCount: selectedBook.bookPageCount,
      },
      category: finalCategory,
      hasSpoiler: hasSpoiler,
    };

    const ratingNum = Number(rating);
    if (!Number.isNaN(ratingNum) && ratingNum > 0) payload.rating = ratingNum;
    if (hasReviewText) payload.content = trimmedBody;

    if (readingStartDate) payload.readingStartDate = readingStartDate;
    if (readingEndDate) payload.readingEndDate = readingEndDate;

    if ((initialReview as any)?.reviewId) {
      payload.reviewId = (initialReview as any).reviewId;
    }

    setIsSubmitting(true);
    const result = await createReview(payload);
    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error);
      showAlert("danger", "Erro ao salvar resenha.");
      return;
    }

    showAlert("success", "Resenha salva com sucesso!");
    const reviewData = result.data;
    const hasReview = Boolean(reviewData && (reviewData as any).reviewId != null);

    if (onSaved && typeof onSaved === "function") {
      try {
        onSaved({ inShelf: true, hasReview, shelfStatus: finalCategory });
      } catch (e) {
      }
    }

    onClose();
  };

  return (
    <div className="addreview-overlay" onClick={onClose}>
      <div className="addreview-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{initialReview ? 'Editar resenha' : 'Escrever resenha'}</h3>

        <form className="addreview-form" onSubmit={handleSubmit}>
          <div className="addreview-grid">
            <div className="addreview-left">
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
              <div className="addreview-header">
                <h2>Compartilhe sua Resenha</h2>
              </div>

              <div className="addreview-field">
                <div className="label">Avaliação</div>
                <div className="addreview-stars" onMouseLeave={() => setHover(0)}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const current = hover || rating;
                    const full = i + 1;
                    const half = i + 0.5;
                    const isFull = current >= full;
                    const isHalf = !isFull && current >= half;
                    const icon = isFull ? "star" : isHalf ? "star_half" : "star_border";

                    return (
                      <span key={i} className={`addreview-star-wrapper ${isFull || isHalf ? "active" : ""}`}>
                        <span
                          className="addreview-star-half addreview-star-half--left"
                          onClick={() => setRating(rating === half ? 0 : half)}
                          onMouseEnter={() => setHover(half)}
                        />
                        <span
                          className="addreview-star-half addreview-star-half--right"
                          onClick={() => setRating(rating === full ? 0 : full)}
                          onMouseEnter={() => setHover(full)}
                        />
                        <span className="material-icons addreview-star-icon">{icon}</span>
                      </span>
                    );
                  })}
                  {(hover || rating) > 0 && (
                    <span className="addreview-rating-value">{hover || rating}</span>
                  )}
                  {userBookId && (
                    <button
                      type="button"
                      className={`addreview-favorite-btn ${isFavorite ? "active" : ""}`}
                      onClick={handleToggleFavorite}
                      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                      <span className="material-icons">
                        {isFavorite ? "favorite" : "favorite_border"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <label className="addreview-field">
                <div className="label">Resenha</div>
                <textarea className="addreview-textarea" value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
              </label>

              <label className="addreview-field addreview-field--spoil">
                <div className="label">Contém spoiler</div>
                <div className="addreview-switch-wrapper">
                  <input 
                    id="hasSpoiler" 
                    type="checkbox" 
                    className="addreview-switch-checkbox"
                    checked={hasSpoiler} 
                    onChange={(e) => setHasSpoiler(e.target.checked)} 
                  />
                  <label htmlFor="hasSpoiler" className="addreview-switch"></label>
                </div>
              </label>

              <div className="addreview-field">
                <div className="label">Categoria</div>
                <div className="category-buttons">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={`category-button cat-${c.value} ${category === c.value ? 'selected' : ''}`}
                      onClick={() => setCategory(c.value)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="addreview-dates">
                <label className="addreview-field addreview-date-field">
                  <div className="label">Início da leitura</div>
                  <input
                    type="date"
                    className="addreview-date-input"
                    value={readingStartDate}
                    onChange={(e) => setReadingStartDate(e.target.value)}
                  />
                </label>
                <label className="addreview-field addreview-date-field">
                  <div className="label">Conclusão da leitura</div>
                  <input
                    type="date"
                    className="addreview-date-input"
                    value={readingEndDate}
                    onChange={(e) => setReadingEndDate(e.target.value)}
                  />
                </label>
              </div>

              {submitError && <p className="addreview-error">{submitError}</p>}

              <div className="addreview-actions">
                {initialReview?.reviewId && (
                  <Button
                    label="Excluir resenha"
                    className="addreview-delete"
                    onClick={handleDeleteReview}
                    disabled={isSubmitting}
                    colors={{
                      bg: "var(--color-remove-border)",
                      color: "var(--color-text-white)",
                      border: "var(--color-remove-border)",
                      hoverBg: "var(--color-remove-hover-border)",
                      activeBg: "var(--color-remove-active-border)"
                    }}
                  />
                )}
                <Button
                  label="Fechar"
                  className="addreview-close"
                  onClick={onClose}
                  disabled={isSubmitting}
                  colors={{
                    bg: "var(--color-surface-hover)",
                    color: "var(--color-text-secondary)",
                    border: "var(--color-border-medium)",
                    hoverBg: "var(--color-surface-muted)",
                    activeBg: "var(--color-btn-active-bg)"
                  }}
                />
                <Button
                  label={isSubmitting ? "Salvando..." : "Salvar"}
                  className="addreview-submit"
                  type="submit"
                  disabled={isSubmitting}
                  colors={{
                    bg: "var(--color-primary)",
                    color: "var(--color-text-white)",
                    border: "var(--color-primary)",
                    hoverBg: "var(--color-button-primary-hover)",
                    activeBg: "var(--color-primary-dark)"
                  }}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReview;
