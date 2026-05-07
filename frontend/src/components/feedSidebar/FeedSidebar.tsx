import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/auth.context";
import { fetchBookshelf } from "../../services/bookshelf.service";
import { fetchAllReviews, type ReviewData } from "../../services/reviews.service";
import { ShelfStatus } from "../../types/bookshelf";
import { FeedSidebarBookItem } from "./FeedSidebarBookItem";
import { FeedSidebarLiaBanner } from "./FeedSidebarLiaBanner";
import { FeedSidebarSection } from "./FeedSidebarSection";
import "./FeedSidebar.scss";

type SidebarVariant = "personal" | "general" | "both";

export function FeedSidebar({ variant = "both", refreshToken = 0 }: { variant?: SidebarVariant; refreshToken?: number }) {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Array<{ title?: string; authors?: string[]; coverUrl?: string | null; googleBooksId?: string | null }>>([]);
  const [toReview, setToReview] = useState<Array<{ title?: string; authors?: string[]; coverUrl?: string | null; googleBooksId?: string | null }>>([]);
  const [popular, setPopular] = useState<Array<{ title?: string; authors?: string[]; coverUrl?: string | null; googleBooksId?: string | null; reviews: number }>>([]);

  useEffect(() => {
    async function loadUserStats() {
      if (!user?.id) {
        return;
      }

      const reviewedBookIds = new Set<string>();
      let allReviews: ReviewData[] = [];

      try {
        const reviewsResult = await fetchAllReviews(1, 10000);
        if (reviewsResult?.success && reviewsResult.data) {
          allReviews = reviewsResult.data as ReviewData[];
          const stats: Record<string, any> = {};
          for (const r of allReviews) {
            const key = r.googleBooksId ?? (r.bookTitle ?? "unknown");
            reviewedBookIds.add(r.googleBooksId ?? "");
            if (!stats[key]) {
              stats[key] = { key, title: r.bookTitle, authors: r.bookAuthors, coverUrl: r.coverUrl, googleBooksId: r.googleBooksId, reviews: 0, ratingSum: 0 };
            }
            stats[key].reviews += 1;
            stats[key].ratingSum += (r.rating ?? 0);
          }

          const items = Object.values(stats);
          const popularSorted = items.sort((a, b) => b.reviews - a.reviews).slice(0, 6);
          setPopular(popularSorted.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load popular books:", err);
      }

      try {
        const wantResult = await fetchBookshelf(ShelfStatus.WantToRead as any);
        if (wantResult?.success && wantResult.data?.books) {
          const items = wantResult.data.books.map((b: any) => ({ title: b.bookTitle, authors: b.bookAuthors, coverUrl: b.bookCoverImage, googleBooksId: b.bookId }));
          setUpcoming(items.slice(0, 3));
        }
      } catch (e) {
        // ignore
      }

      try {
        const readResult = await fetchBookshelf(ShelfStatus.Read as any);
        if (readResult?.success && readResult.data?.books) {
          const reviewedBookIds = new Set<string>(
            allReviews
              .filter((review) => review.userId === user.id)
              .map((review) => review.googleBooksId ?? "")
              .filter(Boolean)
          );

          const items = readResult.data.books
            .filter((b: any) => !reviewedBookIds.has(b.bookId ?? ""))
            .map((b: any) => ({ title: b.bookTitle, authors: b.bookAuthors, coverUrl: b.bookCoverImage, googleBooksId: b.bookId }));
          setToReview(items.slice(0, 3));
        }
      } catch (e) {
        // ignore
      }
    }

    loadUserStats();
  }, [user?.id, refreshToken]);


  return (
    <aside className="feed-sidebar">
      {(variant === "personal" || variant === "both") && (
        <>
          <FeedSidebarSection title="Próxima(s) Leitura(s)">
            <ul className="feed-sidebar-books">
              {upcoming.length === 0 ? (
                <li className="feed-sidebar-book feed-sidebar-empty">
                  <div className="feed-sidebar-empty-message">Adicione livros em "Quero ler".</div>
                </li>
              ) : (
                upcoming.map((b, i) => <FeedSidebarBookItem key={b.googleBooksId ?? i} book={b} index={i} />)
              )}
            </ul>
          </FeedSidebarSection>

          <FeedSidebarSection title="Avalie esse(s) livro(s):">
            <ul className="feed-sidebar-books">
              {toReview.length === 0 ? (
                <li className="feed-sidebar-book feed-sidebar-empty">
                  <div className="feed-sidebar-empty-message">Nenhum livro aguardando resenha.</div>
                </li>
              ) : (
                toReview.map((b, i) => <FeedSidebarBookItem key={b.googleBooksId ?? i} book={b} index={i} />)
              )}
            </ul>
          </FeedSidebarSection>
        </>
      )}

      {(variant === "general" || variant === "both") && (
        <>
          <FeedSidebarSection title="Livros em Alta">
            <ul className="feed-sidebar-books">
              {popular.length === 0 ? (
                <li className="feed-sidebar-book">
                    <div className="feed-sidebar-book-cover">
                    <div className="feed-sidebar-book-placeholder"></div>
                  </div>
                  <div className="feed-sidebar-book-info">
                    <div className="feed-sidebar-book-title">Sem dados</div>
                    <div className="feed-sidebar-book-author">Volte mais tarde</div>
                  </div>
                </li>
              ) : (
                popular.map((p, i) => (
                  <li key={p.googleBooksId ?? i} className="feed-sidebar-book">
                    {p.googleBooksId ? (
                      <Link to={`/book/${p.googleBooksId}`} className="feed-sidebar-book-link">
                        <div className="feed-sidebar-book-cover">
                          {p.coverUrl ? <img src={p.coverUrl} alt={p.title} /> : <div className="feed-sidebar-book-placeholder"></div>}
                        </div>
                        <div className="feed-sidebar-book-info">
                          <div className="feed-sidebar-book-title">{p.title}</div>
                          <div className="feed-sidebar-book-author">{(p.authors || []).join(", ")}</div>
                          <div className="feed-sidebar-book-reviews">{p.reviews} resenhas</div>
                        </div>
                      </Link>
                    ) : (
                      <>
                        <div className="feed-sidebar-book-cover">
                          {p.coverUrl ? <img src={p.coverUrl} alt={p.title} /> : <div className="feed-sidebar-book-placeholder"></div>}
                        </div>
                        <div className="feed-sidebar-book-info">
                          <div className="feed-sidebar-book-title">{p.title}</div>
                          <div className="feed-sidebar-book-author">{(p.authors || []).join(", ")}</div>
                          <div className="feed-sidebar-book-reviews">{p.reviews} resenhas</div>
                        </div>
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          </FeedSidebarSection>

          <FeedSidebarLiaBanner />
        </>
      )}
    </aside>
  );
}
    

