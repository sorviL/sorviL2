import React, { useEffect, useRef, useState } from "react";
import { GoogleBooksAPIController } from "../../assets/javascript/googleBooks/GoogleBooksAPIController";
import { createReview, deleteReview } from "../../services/reviews.service";
import { createReadingUpdate, updateReadingUpdate, deleteReadingUpdate } from "../../services/readingUpdates.service";
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

type ExistingUpdate = {
  readonly updateId: number;
  readonly currentPage: number | null;
  readonly percentage: number | null;
  readonly comment: string | null;
  readonly reaction: string | null;
  readonly hasSpoiler: boolean;
};

type Props = {
  onClose: () => void;
  initialBook?: ReviewBook;
  initialReview?: ExistingReview | null;
  initialUpdate?: ExistingUpdate | null;
  initialCategory?: ShelfStatus | null;
  onSaved?: (status: { inShelf: boolean; hasReview: boolean; shelfStatus?: ShelfStatus | null }) => void;
};

type SearchBook = {
  readonly bookId: string;
  readonly bookTitle: string | null;
  readonly bookAuthors: string[];
  readonly bookCoverImage: string | null;
  readonly bookPublisher: string | null;
  readonly bookPublishedYear: string | null;
  readonly bookPageCount: number | null;
};

const CATEGORIES: { value: ShelfStatus; label: string }[] = [
  { value: "reading", label: "Lendo" },
  { value: "wantToRead", label: "Quero Ler" },
  { value: "read", label: "Lido" },
  { value: "rereading", label: "Relendo" },
  { value: "abandoned", label: "Abandonado" },
];

const REACTIONS: { key: string; emoji: string; label: string }[] = [
  { key: "amei", emoji: "🥰", label: "Amei" },
  { key: "feliz", emoji: "😄", label: "Feliz" },
  { key: "triste", emoji: "😢", label: "Triste" },
  { key: "medo", emoji: "😨", label: "Medo" },
  { key: "raiva", emoji: "😡", label: "Raiva" },
  { key: "nojo", emoji: "🤢", label: "Nojo" },
  { key: "cocô", emoji: "💩", label: "Cocô" },
  { key: "fogo", emoji: "🔥", label: "Fogo" },
];

const AddReview: React.FC<Props> = ({ onClose, initialBook, initialReview, initialUpdate, initialCategory, onSaved }) => {
  const { showAlert } = useAlert();

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  const googleBooksApiRef = useRef<GoogleBooksAPIController | null>(null);
  const searchRequestIdRef = useRef(0);
  const skipOpenRef = useRef(false);
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [body, setBody] = useState<string>("");
  const reviewBodyRef = useRef<string>("");
  const updateBodyRef = useRef<string>("");
  const [category, setCategory] = useState<ShelfStatus | null>(initialCategory ?? null);
  const prevIsUpdateRef = useRef<boolean | null>(null);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userBookId, setUserBookId] = useState<number | null>(null);
  const [readingStartDate, setReadingStartDate] = useState("");
  const [readingEndDate, setReadingEndDate] = useState("");

  const [progressMode, setProgressMode] = useState<"page" | "percentage">("page");
  const [progressValue, setProgressValue] = useState<string>("");
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const isUpdateMode = category === "reading" || category === "rereading";
  const showRating = !isUpdateMode && category !== "wantToRead";
  const requiresRating = category === "read" || category === "abandoned";

  useEffect(() => {
    if (category === "wantToRead") {
      setRating(0);
      setHover(0);
    }
  }, [category]);

  useEffect(() => {
    if (prevIsUpdateRef.current === null) {
      prevIsUpdateRef.current = isUpdateMode;
      return;
    }
    if (prevIsUpdateRef.current === isUpdateMode) return;

    if (isUpdateMode) {
      reviewBodyRef.current = body;
      setBody(updateBodyRef.current);
    } else {
      updateBodyRef.current = body;
      setBody(reviewBodyRef.current);
    }
    prevIsUpdateRef.current = isUpdateMode;
  }, [isUpdateMode]);

  useEffect(() => {
    if (!initialUpdate) return;
    setBody(initialUpdate.comment ?? "");
    setHasSpoiler(initialUpdate.hasSpoiler);
    setSelectedReaction(initialUpdate.reaction);
    if (initialUpdate.currentPage != null) {
      setProgressMode("page");
      setProgressValue(String(initialUpdate.currentPage));
    } else if (initialUpdate.percentage != null) {
      setProgressMode("percentage");
      setProgressValue(String(initialUpdate.percentage));
    }
  }, [initialUpdate]);

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
    const content = initialReview.content ?? "";
    setRating(Number(initialReview.rating ?? 0));
    reviewBodyRef.current = content;
    if (!isUpdateMode) setBody(content);
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
      bookPageCount: book.bookPageCount ?? null,
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

  const handleDeleteUpdate = async () => {
    const updateId = initialUpdate?.updateId;
    if (!updateId) return;
    setIsSubmitting(true);
    const result = await deleteReadingUpdate(updateId);
    setIsSubmitting(false);
    if (!result.success) {
      showAlert("danger", "Erro ao excluir atualização.");
      return;
    }
    showAlert("success", "Atualização excluída com sucesso!");
    if (onSaved) {
      onSaved({ inShelf: true, hasReview: false, shelfStatus: category });
    }
    onClose();
  };

  const handleSubmitUpdate = async () => {
    if (!selectedBook) {
      showAlert("danger", "Selecione um livro.");
      return;
    }

    const numValue = Number(progressValue) || 0;

    if (numValue < 0) {
      showAlert("danger", "O valor de progresso não pode ser negativo.");
      return;
    }
    if (progressMode === "percentage" && numValue > 100) {
      showAlert("danger", "A porcentagem não pode ser maior que 100%.");
      return;
    }
    if (progressMode === "page" && selectedBook?.bookPageCount && numValue > selectedBook.bookPageCount) {
      showAlert("danger", `A página não pode ser maior que o total de ${selectedBook.bookPageCount} páginas.`);
      return;
    }

    const currentPage = progressMode === "page" && numValue > 0 ? numValue : null;
    const percentage = progressMode === "percentage" && numValue > 0 ? numValue : null;
    const trimmedComment = body.trim() || null;

    if (!currentPage && !percentage) {
      showAlert("danger", "Informe a página ou porcentagem de progresso.");
      return;
    }

    setIsSubmitting(true);

    const ensureShelf = await createReview({
      book: {
        googleBooksId: selectedBook.bookId,
        title: selectedBook.bookTitle,
        authors: selectedBook.bookAuthors,
        coverUrl: selectedBook.bookCoverImage,
        pageCount: selectedBook.bookPageCount,
      },
      category: category as ShelfStatus,
    });

    if (!ensureShelf.success) {
      setIsSubmitting(false);
      showAlert("danger", ensureShelf.error || "Erro ao adicionar livro à estante.");
      return;
    }

    const isEditing = initialUpdate?.updateId;
    const result = isEditing
      ? await updateReadingUpdate(initialUpdate.updateId, {
          currentPage,
          percentage,
          comment: trimmedComment,
          reaction: selectedReaction,
          hasSpoiler,
        })
      : await createReadingUpdate({
          googleBooksId: selectedBook.bookId,
          currentPage,
          percentage,
          comment: trimmedComment,
          reaction: selectedReaction,
          hasSpoiler,
        });
    setIsSubmitting(false);

    if (!result.success) {
      showAlert("danger", result.error || "Erro ao salvar atualização.");
      return;
    }

    showAlert("success", isEditing ? "Atualização editada com sucesso!" : "Atualização salva com sucesso!");
    if (onSaved) {
      onSaved({ inShelf: true, hasReview: false, shelfStatus: category });
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdateMode) {
      await handleSubmitUpdate();
      return;
    }

    if (!selectedBook) {
      showAlert("danger", "Selecione um livro.");
      return;
    }

    const trimmedBody = body.trim();
    const hasRating = Number(rating) > 0;

    if (!category) {
      showAlert("danger", "Selecione uma categoria.");
      return;
    }

    if (requiresRating && !hasRating) {
      showAlert("danger", "Selecione uma avaliação.");
      return;
    }

    const finalCategory: ShelfStatus = category;

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
      isFavorite: isFavorite,
    };

    if (hasRating) payload.rating = Number(rating);
    if (trimmedBody) payload.content = trimmedBody;

    if (readingStartDate) payload.readingStartDate = readingStartDate;
    if (readingEndDate) payload.readingEndDate = readingEndDate;

    if ((initialReview as any)?.reviewId) {
      payload.reviewId = (initialReview as any).reviewId;
    }

    setIsSubmitting(true);
    const result = await createReview(payload);
    setIsSubmitting(false);

    if (!result.success) {
      showAlert("danger", result.error || "Erro ao salvar resenha.");
      return;
    }

    const reviewData = result.data;
    const hasReview = Boolean(reviewData && (reviewData as any).reviewId != null);
    showAlert("success", hasReview ? "Resenha salva com sucesso!" : "Livro adicionado à estante!");

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
        <h3>{isUpdateMode ? (initialUpdate ? 'Editar atualização' : 'Nova atualização') : (initialReview ? 'Editar resenha' : 'Escrever resenha')}</h3>

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
                <h2>{isUpdateMode ? "Atualização" : "Compartilhe sua Resenha"}</h2>
              </div>

              {showRating && (
                <div className="addreview-field">
                  <div className="label">Avaliação{requiresRating ? " *" : ""}</div>
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
                    <button
                      type="button"
                      className={`addreview-favorite-btn ${isFavorite ? "active" : ""}`}
                      onClick={userBookId ? handleToggleFavorite : () => setIsFavorite((v) => !v)}
                      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                      <span className="material-icons">
                        {isFavorite ? "favorite" : "favorite_border"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {isUpdateMode && (
                <div className="addreview-field">
                  <div className="label">Progresso</div>
                  <div className="addreview-progress-toggle">
                    <button
                      type="button"
                      className={`addreview-progress-btn ${progressMode === "page" ? "active" : ""}`}
                      onClick={() => { setProgressMode("page"); setProgressValue(""); }}
                    >
                      Página
                    </button>
                    <button
                      type="button"
                      className={`addreview-progress-btn ${progressMode === "percentage" ? "active" : ""}`}
                      onClick={() => { setProgressMode("percentage"); setProgressValue(""); }}
                    >
                      Porcentagem
                    </button>
                  </div>
                  <div className="addreview-progress-input-wrap">
                    <input
                      type="number"
                      className="addreview-progress-input"
                      placeholder={progressMode === "page" ? "Ex: 142" : "Ex: 65"}
                      value={progressValue}
                      min={0}
                      max={progressMode === "percentage" ? 100 : (selectedBook?.bookPageCount ?? undefined)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") { setProgressValue(""); return; }
                        const num = Number(raw);
                        if (num < 0) return;
                        if (progressMode === "percentage" && num > 100) return;
                        if (progressMode === "page" && selectedBook?.bookPageCount && num > selectedBook.bookPageCount) return;
                        setProgressValue(raw);
                      }}
                    />
                    <span className="addreview-progress-suffix">
                      {progressMode === "page"
                        ? `/ ${selectedBook?.bookPageCount ?? "?"} pg`
                        : "%"}
                    </span>
                  </div>
                </div>
              )}

              {isUpdateMode && (
                <div className="addreview-field">
                  <div className="label">Como você está se sentindo?</div>
                  <div className="addreview-reactions">
                    {REACTIONS.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        className={`addreview-reaction-btn ${selectedReaction === r.key ? "active" : ""}`}
                        onClick={() => setSelectedReaction(selectedReaction === r.key ? null : r.key)}
                        title={r.label}
                      >
                        <span className="addreview-reaction-emoji">{r.emoji}</span>
                        <span className="addreview-reaction-label">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="addreview-field">
                <div className="label">{isUpdateMode ? "Comentário" : "Resenha"}</div>
                <textarea className="addreview-textarea" value={body} onChange={(e) => setBody(e.target.value)} rows={isUpdateMode ? 4 : 8} />
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

              {!isUpdateMode && (
                <div className="addreview-dates">
                  <label className="addreview-field addreview-date-field">
                    <div className="label">Início da leitura</div>
                    <input
                      type="date"
                      className="addreview-date-input"
                      value={readingStartDate}
                      max={readingEndDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setReadingStartDate(e.target.value)}
                    />
                  </label>
                  <label className="addreview-field addreview-date-field">
                    <div className="label">Conclusão da leitura</div>
                    <input
                      type="date"
                      className="addreview-date-input"
                      value={readingEndDate}
                      min={readingStartDate || undefined}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setReadingEndDate(e.target.value)}
                    />
                  </label>
                </div>
              )}

              <div className="addreview-actions">
                {!isUpdateMode && initialReview?.reviewId && (
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
                {isUpdateMode && initialUpdate?.updateId && (
                  <Button
                    label="Excluir atualização"
                    className="addreview-delete"
                    onClick={handleDeleteUpdate}
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
