import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleBooksAPIController } from "../../assets/javascript/googleBooks/GoogleBooksAPIController";
import type { NavbarSearchResult, UseNavbarSearchState, UseNavbarSearchActions } from "./navbar.types";

const googleBooksApi = new GoogleBooksAPIController();

export function useNavbarSearch(): UseNavbarSearchState & UseNavbarSearchActions {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<NavbarSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRequestIdRef = useRef(0);

    useEffect(() => {
        const normalizedQuery = searchQuery.trim();

        googleBooksApi.cancelPendingSearch();

        if (!normalizedQuery) {
            setSearchResults([]);
            setSearchError(null);
            setIsSearching(false);
            setIsSearchOpen(false);
            return;
        }

        setIsSearching(true);
        setSearchError(null);
        setIsSearchOpen(true);

        const currentRequestId = searchRequestIdRef.current + 1;
        searchRequestIdRef.current = currentRequestId;

        const debounceId = window.setTimeout(async () => {
            try {
                const result = await googleBooksApi.quickSearch(normalizedQuery);

                if (searchRequestIdRef.current !== currentRequestId) {
                    return;
                }

                setSearchResults((result?.books ?? []).slice(0, 5));
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
            googleBooksApi.cancelPendingSearch();
        };
    }, [searchQuery]);

    const handleBookSelect = useCallback(
        (bookId: string) => {
            setSearchQuery("");
            setSearchResults([]);
            setIsSearchOpen(false);
            navigate(`/book/${bookId}`);
        },
        [navigate]
    );

    return {
        searchQuery,
        searchResults,
        isSearching,
        searchError,
        isSearchOpen,
        setSearchQuery,
        setIsSearchOpen,
        handleBookSelect
    };
}
