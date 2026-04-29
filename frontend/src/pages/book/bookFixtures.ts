import type { Book } from "../../types/book";

export const mockBookFull: Book = {
  bookId: "mock-full",
  bookTitle: "The Shadow of the Wind",
  bookSubtitle: "A Novel of Mystery and Memory",
  bookAuthors: ["Carlos Ruiz Zafón"],
  bookPublisher: "Penguin",
  bookPublishedDate: "2001-04-01",
  bookDescription:
    "Barcelona, 1945. A city slowly heals in the aftermath of the Spanish Civil War. A young bookseller's son discovers a forgotten book that changes everything.",
  bookPageCount: 487,
  bookCategories: ["Fiction", "Mystery"],
  bookAverageRating: 4.8,
  bookRatingsCount: 12000,
  bookLanguage: "en",
  bookIsbn10: "0143034901",
  bookIsbn13: "9780143034902",
  bookCoverImage: "https://picsum.photos/seed/shadow/600/900",
  bookSmallCoverImage: "https://picsum.photos/seed/shadow/220/330",
  bookPreviewLink: "https://books.google.com/",
  bookInfoLink: "https://books.google.com/",
};

export const mockBookNoCover: Book = {
  ...mockBookFull,
  bookId: "mock-nocover",
  bookTitle: "Invisible Cover Example",
  bookCoverImage: null,
  bookSmallCoverImage: null,
};

export const mockBookNoSubtitle: Book = {
  ...mockBookFull,
  bookId: "mock-nosub",
  bookTitle: "Minimal Title",
  bookSubtitle: null,
};

export const MOCK_BOOKS: Record<string, Book> = {
  "mock-full": mockBookFull,
  "mock-nocover": mockBookNoCover,
  "mock-nosub": mockBookNoSubtitle,
};

export default MOCK_BOOKS;
