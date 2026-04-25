import { ShelfStatus } from "../../types/bookshelf";

export const BOOKSHELF_MOCK_DATA = [
    {
        bookId: "fake-001",
        bookTitle: "Beyond the Horizon",
        bookAuthors: ["Elena Vance"],
        bookCoverImage: "https://picsum.photos/seed/book1/200/300",
        shelfStatus: ShelfStatus.Reading,
        userRating: 3.5
    },
    {
        bookId: "fake-002",
        bookTitle: "The Silent Archive",
        bookAuthors: ["Marcus Thorne"],
        bookCoverImage: "https://picsum.photos/seed/book2/200/300",
        shelfStatus: ShelfStatus.Reading,
        userRating: 5
    },
    {
        bookId: "fake-003",
        bookTitle: "Starlight Echoes",
        bookAuthors: ["Sarah J. Miller"],
        bookCoverImage: "https://picsum.photos/seed/book3/200/300",
        shelfStatus: ShelfStatus.WantToRead,
        userRating: 0
    },
    {
        bookId: "fake-004",
        bookTitle: "Dust and Shadows",
        bookAuthors: ["T.H. Lawrence"],
        bookCoverImage: "https://picsum.photos/seed/book4/200/300",
        shelfStatus: ShelfStatus.Abandoned,
        userRating: 2
    },
    {
        bookId: "fake-005",
        bookTitle: "A Time to Speak",
        bookAuthors: ["Julian West"],
        bookCoverImage: "https://picsum.photos/seed/book5/200/300",
        shelfStatus: ShelfStatus.Rereading,
        userRating: 5
    },
    {
        bookId: "fake-006",
        bookTitle: "Neural Networks and Dreams",
        bookAuthors: ["Dr. Aria Thorne"],
        bookCoverImage: "https://picsum.photos/seed/book6/200/300",
        shelfStatus: ShelfStatus.Reading,
        userRating: 3
    },
    {
        bookId: "fake-007",
        bookTitle: "Deep Work Strategies",
        bookAuthors: ["Cal Newport"],
        bookCoverImage: "https://picsum.photos/seed/book7/200/300",
        shelfStatus: ShelfStatus.Read,
        userRating: 5
    },
    {
        bookId: "fake-008",
        bookTitle: "The Martian Colony",
        bookAuthors: ["C.L. Sterling"],
        bookCoverImage: "https://picsum.photos/seed/book8/200/300",
        shelfStatus: ShelfStatus.WantToRead,
        userRating: 0
    }
];
