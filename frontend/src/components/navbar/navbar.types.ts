export type NavbarSearchResult = {
    bookId: string;
    bookTitle: string | null;
    bookCoverImage: string | null;
};

export type UseNavbarSearchState = {
    searchQuery: string;
    searchResults: NavbarSearchResult[];
    isSearching: boolean;
    searchError: string | null;
    isSearchOpen: boolean;
};

export type UseNavbarSearchActions = {
    setSearchQuery: (query: string) => void;
    setIsSearchOpen: (open: boolean) => void;
    handleBookSelect: (bookId: string) => void;
};
