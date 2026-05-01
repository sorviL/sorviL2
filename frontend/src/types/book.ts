export interface Book {
    bookId: string;
    bookTitle: string | null;
    bookSubtitle: string | null;
    bookAuthors: string[];
    bookPublisher: string | null;
    bookPublishedDate: string | null;
    bookDescription: string | null;
    bookPageCount: number | null;
    bookCategories: string[];
    bookAverageRating: number | null;
    bookRatingsCount: number | null;
    bookLanguage: string | null;
    bookIsbn10: string | null;
    bookIsbn13: string | null;
    bookCoverImage: string | null;
    bookSmallCoverImage: string | null;
    bookPreviewLink: string | null;
    bookInfoLink: string | null;
}
